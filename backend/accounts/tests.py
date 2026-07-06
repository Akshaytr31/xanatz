from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APITestCase
from rest_framework import status
from .models import Company, CompanyReview, Profile, Experience

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
