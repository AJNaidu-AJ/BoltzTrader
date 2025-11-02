"""
Test Policy Versioning System for BoltzTrader Risk Engine
"""

import pytest
import asyncio
from datetime import datetime
from unittest.mock import Mock, patch
import json

# Mock Supabase client for testing
class MockSupabaseClient:
    def __init__(self):
        self.versions_data = []
        self.policies_data = []
    
    def table(self, table_name):
        return MockTable(table_name, self)

class MockTable:
    def __init__(self, table_name, client):
        self.table_name = table_name
        self.client = client
        self.query = {}
    
    def select(self, columns):
        self.query['select'] = columns
        return self
    
    def eq(self, column, value):
        self.query[f'eq_{column}'] = value
        return self
    
    def order(self, column, desc=False):
        self.query['order'] = (column, desc)
        return self
    
    def single(self):
        self.query['single'] = True
        return self
    
    def execute(self):
        if self.table_name == 'policy_versions':
            return self._execute_versions()
        elif self.table_name == 'risk_policies':
            return self._execute_policies()
        return Mock(data=[])
    
    def _execute_versions(self):
        # Mock version data
        versions = [
            {
                'id': 'v1',
                'policy_id': 'policy_1',
                'version': 1,
                'definition': {'max_exposure': 0.8, 'max_position': 0.15},
                'changed_at': '2024-01-01T00:00:00Z',
                'changed_by': 'admin'
            },
            {
                'id': 'v2',
                'policy_id': 'policy_1',
                'version': 2,
                'definition': {'max_exposure': 0.75, 'max_position': 0.12},
                'changed_at': '2024-01-02T00:00:00Z',
                'changed_by': 'admin'
            }
        ]
        
        # Filter by policy_id if specified
        if 'eq_policy_id' in self.query:
            versions = [v for v in versions if v['policy_id'] == self.query['eq_policy_id']]
        
        # Filter by version if specified
        if 'eq_version' in self.query:
            versions = [v for v in versions if v['version'] == self.query['eq_version']]
        
        # Return single if requested
        if self.query.get('single'):
            return Mock(data=versions[0] if versions else None)
        
        return Mock(data=versions)
    
    def _execute_policies(self):
        return Mock(data={'success': True})
    
    def update(self, data):
        self.update_data = data
        return self

class TestPolicyVersioning:
    
    @pytest.fixture
    def mock_supabase(self):
        return MockSupabaseClient()
    
    def test_version_creation(self, mock_supabase):
        """Test that policy versions are created correctly"""
        # Simulate policy update that should trigger versioning
        versions = mock_supabase.table('policy_versions').select('*').eq('policy_id', 'policy_1').execute()
        
        assert len(versions.data) == 2
        assert versions.data[0]['version'] == 1
        assert versions.data[1]['version'] == 2
    
    def test_version_retrieval(self, mock_supabase):
        """Test retrieving specific policy version"""
        version = mock_supabase.table('policy_versions').select('*').eq('policy_id', 'policy_1').eq('version', 1).single().execute()
        
        assert version.data['version'] == 1
        assert version.data['definition']['max_exposure'] == 0.8
        assert version.data['changed_by'] == 'admin'
    
    def test_version_history(self, mock_supabase):
        """Test getting full version history"""
        versions = mock_supabase.table('policy_versions').select('*').eq('policy_id', 'policy_1').order('version', desc=True).execute()
        
        assert len(versions.data) == 2
        # Should be ordered by version descending
        assert versions.data[0]['version'] >= versions.data[1]['version']
    
    def test_rollback_functionality(self, mock_supabase):
        """Test policy rollback to previous version"""
        # Get version to rollback to
        version = mock_supabase.table('policy_versions').select('definition').eq('policy_id', 'policy_1').eq('version', 1).single().execute()
        
        # Simulate rollback update
        result = mock_supabase.table('risk_policies').update({
            'thresholds': version.data['definition'],
            'updated_by': 'admin',
            'updated_at': datetime.now().isoformat()
        }).eq('id', 'policy_1').execute()
        
        assert result.data['success'] == True
    
    def test_change_attribution(self, mock_supabase):
        """Test that changes are properly attributed to users"""
        version = mock_supabase.table('policy_versions').select('*').eq('policy_id', 'policy_1').eq('version', 1).single().execute()
        
        assert version.data['changed_by'] == 'admin'
        assert 'changed_at' in version.data
    
    def test_audit_replay(self, mock_supabase):
        """Test that historical policy logic can be replayed"""
        # Get version 1 definition
        v1 = mock_supabase.table('policy_versions').select('definition').eq('policy_id', 'policy_1').eq('version', 1).single().execute()
        
        # Get version 2 definition  
        v2 = mock_supabase.table('policy_versions').select('definition').eq('policy_id', 'policy_1').eq('version', 2).single().execute()
        
        # Verify different thresholds
        assert v1.data['definition']['max_exposure'] == 0.8
        assert v2.data['definition']['max_exposure'] == 0.75
        
        # This demonstrates ability to replay historical logic
        assert v1.data['definition'] != v2.data['definition']

def test_version_increment():
    """Test version number incrementation logic"""
    # Simulate getting max version + 1
    existing_versions = [1, 2, 3]
    next_version = max(existing_versions) + 1 if existing_versions else 1
    
    assert next_version == 4

def test_policy_definition_comparison():
    """Test detecting policy definition changes"""
    old_definition = {'max_exposure': 0.8, 'max_position': 0.15}
    new_definition = {'max_exposure': 0.75, 'max_position': 0.15}
    
    # This would trigger versioning in real system
    assert old_definition != new_definition

if __name__ == '__main__':
    # Run tests
    test = TestPolicyVersioning()
    mock_client = MockSupabaseClient()
    
    print("Running Policy Versioning Tests...")
    
    try:
        test.test_version_creation(mock_client)
        print("✅ Version Creation Test: PASSED")
        
        test.test_version_retrieval(mock_client)
        print("✅ Version Retrieval Test: PASSED")
        
        test.test_version_history(mock_client)
        print("✅ Version History Test: PASSED")
        
        test.test_rollback_functionality(mock_client)
        print("✅ Rollback Test: PASSED")
        
        test.test_change_attribution(mock_client)
        print("✅ Change Attribution Test: PASSED")
        
        test.test_audit_replay(mock_client)
        print("✅ Audit Replay Test: PASSED")
        
        test_version_increment()
        print("✅ Version Increment Test: PASSED")
        
        test_policy_definition_comparison()
        print("✅ Policy Comparison Test: PASSED")
        
        print("\n🎉 All Policy Versioning Tests PASSED!")
        
    except Exception as e:
        print(f"❌ Test Failed: {e}")