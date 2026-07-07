from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APITestCase
from rest_framework import status
from .models import Company, CompanyReview, Profile, Experience, FreelancerReview, RFP, RFPInterest

User = get_user_model()

class CompanyReviewTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='testuser@example.com',
            password='password123',
            first_name='Test',
            last_name='User'
        )
        self.client.force_authenticate(user=self.user)
        
        # Create a company
        self.company = Company.objects.create(
            name='Acme Corp',
            tagline='Best company',
            description='We build everything',
            creator=self.user
        )
        
    def test_review_creation_and_linking(self):
        # Create a review for Acme Corp
        review = CompanyReview.objects.create(
            reviewer=self.user,
            company_name='Acme Corp',
            rating=5,
            review_text='Amazing work environment!'
        )
        # Should link automatically because Acme Corp already exists
        self.assertEqual(review.company, self.company)
        
    def test_review_post_linking_signal(self):
        # Create a review for a non-existent company
        review = CompanyReview.objects.create(
            reviewer=self.user,
            company_name='Future Corp',
            rating=4,
            review_text='Decent'
        )
        self.assertIsNone(review.company)
        
        # Now create Future Corp
        future_company = Company.objects.create(
            name='Future Corp',
            tagline='Future is now',
            creator=self.user
        )
        
        # Reload review from DB to check if signal linked it
        review.refresh_from_db()
        self.assertEqual(review.company, future_company)

    def test_company_serializer_fields(self):
        CompanyReview.objects.create(
            reviewer=self.user,
            company_name='Acme Corp',
            rating=5,
            review_text='Great'
        )
        CompanyReview.objects.create(
            reviewer=self.user,
            company_name='Acme Corp',
            rating=3,
            review_text='OK'
        )
        
        response = self.client.get(f'/api/companies/{self.company.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['reviews_count'], 2)
        self.assertEqual(response.data['average_rating'], 4.0)
        self.assertEqual(len(response.data['reviews']), 2)
 
    def test_create_review_via_api(self):
        data = {
            'company_name': 'Acme Corp',
            'rating': 4,
            'review_text': 'Highly recommended'
        }
        response = self.client.post('/api/reviews/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        review = CompanyReview.objects.get(review_text='Highly recommended')
        self.assertEqual(review.company, self.company)
        self.assertEqual(review.rating, 4)


class FreelancerReviewTests(APITestCase):
    def setUp(self):
        self.company_user = User.objects.create_user(
            email='company@example.com',
            password='password123',
            first_name='Company',
            last_name='User'
        )
        self.freelancer_user = User.objects.create_user(
            email='freelancer@example.com',
            password='password123',
            first_name='Freelancer',
            last_name='User'
        )
        
        # Get and update freelancer profile
        self.freelancer_profile = self.freelancer_user.profile
        self.freelancer_profile.is_freelancer = True
        self.freelancer_profile.save()
        
        # Create company
        self.company = Company.objects.create(
            name='Star Tech',
            creator=self.company_user
        )
        
        # Create RFP
        self.rfp = RFP.objects.create(
            company=self.company,
            title='Website Redesign',
            description='Redesign our website',
            budget=5000
        )
        
        # Create RFP interest
        self.interest = RFPInterest.objects.create(
            rfp=self.rfp,
            user=self.freelancer_user,
            company_name='',
            email='freelancer@example.com',
            proposal_summary='I can do this redesign quickly!',
            status='accepted'
        )
        
        self.client.force_authenticate(user=self.company_user)

    def test_create_freelancer_review_via_api(self):
        data = {
            'freelancer': self.freelancer_user.id,
            'rfp_interest': self.interest.id,
            'rating': 5,
            'review_text': 'Exceptional delivery speed!'
        }
        response = self.client.post('/api/freelancer-reviews/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Check review exists
        review = FreelancerReview.objects.get(review_text='Exceptional delivery speed!')
        self.assertEqual(review.freelancer, self.freelancer_user)
        self.assertEqual(review.reviewer, self.company_user)
        self.assertEqual(review.rating, 5)
        
        # Check RFP Interest is updated
        self.interest.refresh_from_db()
        self.assertTrue(self.interest.is_reviewed)

    def test_freelancer_reviews_serialized_on_user(self):
        # Create a review
        FreelancerReview.objects.create(
            reviewer=self.company_user,
            freelancer=self.freelancer_user,
            rfp_interest=self.interest,
            rating=5,
            review_text='Great job!'
        )
        
        response = self.client.get(f'/api/public-profile/{self.freelancer_profile.public_id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['reviews_count'], 1)
        self.assertEqual(response.data['average_rating'], 5.0)
        self.assertEqual(response.data['reviews'][0]['review_text'], 'Great job!')


class CompanyReviewSegregationTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='user@example.com',
            password='password123',
            first_name='John',
            last_name='Doe'
        )
        self.partner_user = User.objects.create_user(
            email='partner@example.com',
            password='password123',
            first_name='Jane',
            last_name='Smith'
        )
        self.company = Company.objects.create(
            name='Test Company',
            creator=self.user
        )
        
        # 1. Employee Review (rfp_interest is null)
        CompanyReview.objects.create(
            company=self.company,
            reviewer=self.user,
            rating=4,
            review_text='Good workplace'
        )
        
        # Create RFP & RFPInterest to link for partner review
        self.rfp = RFP.objects.create(
            company=self.company,
            title='Project X',
            description='Project X details',
            budget=2000
        )
        self.interest = RFPInterest.objects.create(
            rfp=self.rfp,
            user=self.partner_user,
            company_name='Partner Corp',
            email='partner@example.com',
            proposal_summary='Summary',
            status='accepted'
        )
        
        # 2. Partner Review (rfp_interest is not null)
        CompanyReview.objects.create(
            company=self.company,
            reviewer=self.partner_user,
            rfp_interest=self.interest,
            rating=5,
            review_text='Excellent partner'
        )

    def test_company_review_segregation_in_serializer(self):
        from accounts.serializers import CompanySerializer
        serializer = CompanySerializer(self.company)
        data = serializer.data
        
        # Total counts/ratings
        self.assertEqual(data['reviews_count'], 2)
        self.assertEqual(data['average_rating'], 4.5)
        
        # Employee reviews segregation
        self.assertEqual(data['employee_reviews_count'], 1)
        self.assertEqual(data['employee_average_rating'], 4.0)
        self.assertEqual(data['employee_reviews'][0]['review_text'], 'Good workplace')
        
        # Partner reviews segregation
        self.assertEqual(data['partner_reviews_count'], 1)
        self.assertEqual(data['partner_average_rating'], 5.0)
        self.assertEqual(data['partner_reviews'][0]['review_text'], 'Excellent partner')

