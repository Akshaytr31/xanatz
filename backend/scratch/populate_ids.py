import os
import sys
import django

# Set up Django environment
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_core.settings')
django.setup()

from accounts.models import JobOpening, RFP, CompanyReview, FreelancerReview

def populate():
    print("Populating JobOpenings...")
    jobs = JobOpening.objects.filter(job_id__isnull=True) | JobOpening.objects.filter(job_id="")
    for j in jobs:
        j.job_id = f"JOB-{j.pk:05d}"
        j.save(update_fields=['job_id'])
        print(f"Updated Job {j.pk} -> {j.job_id}")

    print("Populating RFPs...")
    rfps = RFP.objects.filter(rfp_id__isnull=True) | RFP.objects.filter(rfp_id="")
    for r in rfps:
        r.rfp_id = f"RFP-{r.pk:05d}"
        r.save(update_fields=['rfp_id'])
        print(f"Updated RFP {r.pk} -> {r.rfp_id}")

    print("Populating CompanyReviews...")
    cr = CompanyReview.objects.filter(review_id__isnull=True) | CompanyReview.objects.filter(review_id="")
    for c in cr:
        c.review_id = f"RIV-{c.pk:05d}"
        c.save(update_fields=['review_id'])
        print(f"Updated Company Review {c.pk} -> {c.review_id}")

    print("Populating FreelancerReviews...")
    fr = FreelancerReview.objects.filter(review_id__isnull=True) | FreelancerReview.objects.filter(review_id="")
    for f in fr:
        f.review_id = f"RIV-{f.pk:05d}"
        f.save(update_fields=['review_id'])
        print(f"Updated Freelancer Review {f.pk} -> {f.review_id}")

    print("Migration complete!")

if __name__ == "__main__":
    populate()
