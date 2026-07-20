import os
import django
import sys

# Set up Django environment
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend_core.settings")
django.setup()

from accounts.models import Company, CompanyFAQ, User
from accounts.serializers import CompanySerializer, PublicCompanySerializer, CompanyFAQSerializer

def run_verification():
    print("--- Starting FAQ Verification ---")
    
    # 1. Get or create a test user and company
    user = User.objects.first()
    if not user:
        print("No user found in database. Please run migrations/seed data.")
        return
        
    company = Company.objects.first()
    if not company:
        print("No company found in database. Creating a test company...")
        company = Company.objects.create(
            name="Test Verification Corp",
            industry="technology",
            location="San Francisco",
            creator=user
        )
        
    print(f"Using Company: {company.name} (ID: {company.id})")
    
    # Clean up existing test FAQs
    CompanyFAQ.objects.filter(company=company).delete()
    
    # 2. Test Model Creation
    faq1 = CompanyFAQ.objects.create(
        company=company,
        question="What is the mission of the company?",
        answer="To innovate and verify components seamlessly."
    )
    faq2 = CompanyFAQ.objects.create(
        company=company,
        question="How can I contact support?",
        answer="You can email us at support@example.com."
    )
    print("Successfully created 2 test FAQs.")
    
    # 3. Test CompanyFAQSerializer
    serializer = CompanyFAQSerializer(faq1)
    print("\nCompanyFAQSerializer output:")
    print(serializer.data)
    
    # 4. Test CompanySerializer (dashboard view)
    c_serializer = CompanySerializer(company)
    print("\nCompanySerializer 'faqs' field validation:")
    faqs_data = c_serializer.data.get('faqs')
    print(f"Number of FAQs in serialized data: {len(faqs_data)}")
    for f in faqs_data:
        print(f" - Q: {f['question']} | A: {f['answer']}")
        
    # 5. Test PublicCompanySerializer (public profile view)
    pub_serializer = PublicCompanySerializer(company)
    print("\nPublicCompanySerializer 'faqs' field validation:")
    pub_faqs_data = pub_serializer.data.get('faqs')
    print(f"Number of FAQs in public serialized data: {len(pub_faqs_data)}")
    for f in pub_faqs_data:
        print(f" - Q: {f['question']} | A: {f['answer']}")
        
    # Clean up
    CompanyFAQ.objects.filter(company=company).delete()
    print("\nCleanup completed.")
    print("--- Verification Finished Successfully ---")

if __name__ == "__main__":
    run_verification()
