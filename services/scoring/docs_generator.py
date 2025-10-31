from fastapi import FastAPI
from fastapi.openapi.utils import get_openapi
import json

def generate_api_docs(app: FastAPI):
    """Generate OpenAPI documentation for the API"""
    openapi_schema = get_openapi(
        title="BoltzTrader API",
        version="1.0.0",
        description="AI-powered trading signals and analytics API",
        routes=app.routes,
    )
    
    # Add custom documentation
    openapi_schema["info"]["contact"] = {
        "name": "BoltzTrader Support",
        "email": "api@boltztrader.com",
        "url": "https://boltztrader.com/support"
    }
    
    openapi_schema["info"]["license"] = {
        "name": "Commercial License",
        "url": "https://boltztrader.com/license"
    }
    
    # Add authentication schemes
    openapi_schema["components"]["securitySchemes"] = {
        "ApiKeyAuth": {
            "type": "apiKey",
            "in": "header",
            "name": "X-API-Key"
        },
        "BearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT"
        }
    }
    
    # Add rate limiting info
    openapi_schema["info"]["x-rateLimit"] = {
        "default": "1000 requests per hour",
        "pro": "10000 requests per hour",
        "enterprise": "100000 requests per hour"
    }
    
    return openapi_schema

def save_docs_to_file(schema, filename="api_docs.json"):
    """Save API documentation to file"""
    with open(filename, 'w') as f:
        json.dump(schema, f, indent=2)
    print(f"API documentation saved to {filename}")

if __name__ == "__main__":
    from main import app
    schema = generate_api_docs(app)
    save_docs_to_file(schema)