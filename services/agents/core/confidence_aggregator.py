from typing import List, Dict, Any
import numpy as np

def adjust_confidence(agent_results: List[Dict[str, Any]], 
                     peer_feedback: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Adjust agent confidence based on peer agreement"""
    
    for agent_result in agent_results:
        agent_signal = agent_result['signal']
        base_confidence = agent_result['confidence']
        
        # Count peers that agree with this agent
        peer_agreements = sum(1 for peer in peer_feedback 
                            if peer['signal'] == agent_signal)
        
        total_peers = len(peer_feedback)
        
        if total_peers > 0:
            agreement_ratio = peer_agreements / total_peers
            
            # Boost confidence if peers agree, reduce if they disagree
            confidence_multiplier = 0.8 + (agreement_ratio * 0.4)  # Range: 0.8 to 1.2
            
            adjusted_confidence = min(1.0, base_confidence * confidence_multiplier)
            agent_result['confidence'] = round(adjusted_confidence, 3)
            agent_result['peer_agreement'] = round(agreement_ratio, 3)
        else:
            agent_result['peer_agreement'] = 0.0
    
    return agent_results

def calculate_network_confidence(agent_signals: List[Dict[str, Any]]) -> float:
    """Calculate overall network confidence based on agent agreement"""
    
    if not agent_signals:
        return 0.0
    
    # Group signals by type
    signal_groups = {'BUY': [], 'SELL': [], 'HOLD': []}
    
    for signal in agent_signals:
        signal_type = signal['signal']
        if signal_type in signal_groups:
            signal_groups[signal_type].append(signal['confidence'])
    
    # Find the dominant signal group
    max_group_size = max(len(group) for group in signal_groups.values())
    
    if max_group_size == 0:
        return 0.0
    
    # Calculate confidence based on group size and individual confidences
    for signal_type, confidences in signal_groups.items():
        if len(confidences) == max_group_size:
            # Weight by both group size and average confidence
            group_weight = len(confidences) / len(agent_signals)
            avg_confidence = np.mean(confidences) if confidences else 0
            
            network_confidence = group_weight * avg_confidence
            return round(network_confidence, 3)
    
    return 0.0

def detect_outliers(agent_signals: List[Dict[str, Any]], 
                   threshold: float = 2.0) -> List[str]:
    """Detect outlier agents based on signal deviation"""
    
    if len(agent_signals) < 3:
        return []
    
    # Convert signals to numeric values for analysis
    signal_values = []
    agent_ids = []
    
    for signal in agent_signals:
        value = 1 if signal['signal'] == 'BUY' else -1 if signal['signal'] == 'SELL' else 0
        signal_values.append(value)
        agent_ids.append(signal['agent_id'])
    
    signal_array = np.array(signal_values)
    mean_signal = np.mean(signal_array)
    std_signal = np.std(signal_array)
    
    if std_signal == 0:
        return []
    
    # Find agents with signals more than threshold standard deviations from mean
    outliers = []
    for i, (agent_id, value) in enumerate(zip(agent_ids, signal_values)):
        z_score = abs(value - mean_signal) / std_signal
        if z_score > threshold:
            outliers.append(agent_id)
    
    return outliers

def calculate_consensus_strength(agent_signals: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Calculate various metrics of consensus strength"""
    
    if not agent_signals:
        return {
            'strength': 0.0,
            'unanimity': 0.0,
            'weighted_agreement': 0.0,
            'confidence_variance': 0.0
        }
    
    # Count signal types
    signal_counts = {'BUY': 0, 'SELL': 0, 'HOLD': 0}
    confidences = []
    weights = []
    
    for signal in agent_signals:
        signal_counts[signal['signal']] += 1
        confidences.append(signal['confidence'])
        weights.append(signal.get('weight', 1.0))
    
    total_agents = len(agent_signals)
    max_count = max(signal_counts.values())
    
    # Unanimity: how unified the agents are
    unanimity = max_count / total_agents
    
    # Weighted agreement: considering agent weights
    weighted_sum = sum(weights)
    if weighted_sum > 0:
        dominant_signal = max(signal_counts, key=signal_counts.get)
        weighted_agreement = sum(signal.get('weight', 1.0) 
                               for signal in agent_signals 
                               if signal['signal'] == dominant_signal) / weighted_sum
    else:
        weighted_agreement = 0.0
    
    # Confidence variance: how consistent confidence levels are
    confidence_variance = np.var(confidences) if confidences else 0.0
    
    # Overall strength: combination of unanimity and confidence
    avg_confidence = np.mean(confidences) if confidences else 0.0
    strength = unanimity * avg_confidence
    
    return {
        'strength': round(strength, 3),
        'unanimity': round(unanimity, 3),
        'weighted_agreement': round(weighted_agreement, 3),
        'confidence_variance': round(confidence_variance, 4),
        'avg_confidence': round(avg_confidence, 3)
    }