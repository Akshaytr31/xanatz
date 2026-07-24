import os
import sys
import django

# Set up Django environment
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_core.settings')
django.setup()

from accounts.models import Company, JobOpening, RFP, CompanyReview, FreelancerReview, generate_company_id

def populate():
    print("Populating Company IDs...")
    for c in Company.objects.all():
        if not c.company_id:
            c.company_id = generate_company_id(c.pk)
            c.save(update_fields=['company_id'])
            print(f"Updated Company {c.pk} -> {c.company_id}")
        else:
            print(f"Company {c.pk} already has company_id {c.company_id}")

    print("Populating/Updating JobOpenings...")
    for j in JobOpening.objects.all():
        cid = j.company.company_id if (j.company and j.company.company_id) else "0000"
        expected_job_id = f"JOB-{cid}-{j.pk:06d}"
        if j.job_id != expected_job_id:
            j.job_id = expected_job_id
            j.save(update_fields=['job_id'])
            print(f"Updated Job {j.pk} -> {j.job_id}")

    print("Populating/Updating RFPs...")
    for r in RFP.objects.all():
        cid = r.company.company_id if (r.company and r.company.company_id) else "0000"
        expected_rfp_id = f"RFP-{cid}-{r.pk:06d}"
        if r.rfp_id != expected_rfp_id:
            r.rfp_id = expected_rfp_id
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

    print("ID setup and update complete!")

if __name__ == "__main__":
    populate()
