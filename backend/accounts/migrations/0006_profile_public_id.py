import uuid
from django.db import migrations, models

def gen_uuid(apps, schema_editor):
    Profile = apps.get_model('accounts', 'Profile')
    for row in Profile.objects.all():
        row.public_id = uuid.uuid4()
        row.save(update_fields=['public_id'])

class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0005_experience_company_website'),
    ]

    operations = [
        migrations.AddField(
            model_name='profile',
            name='public_id',
            field=models.UUIDField(default=uuid.uuid4, editable=False, null=True),
        ),
        migrations.RunPython(gen_uuid, reverse_code=migrations.RunPython.noop),
        migrations.AlterField(
            model_name='profile',
            name='public_id',
            field=models.UUIDField(default=uuid.uuid4, editable=False, unique=True),
        ),
    ]
