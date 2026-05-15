import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_core.settings')
django.setup()

from django.db import connection

sqls = [
    """CREATE TABLE `accounts_companymember` (`id` bigint AUTO_INCREMENT NOT NULL PRIMARY KEY, `access_role` varchar(20) NOT NULL, `position` varchar(255) NULL, `joined_at` datetime(6) NOT NULL, `company_id` bigint NOT NULL, `user_id` bigint NOT NULL);""",
    """ALTER TABLE `accounts_companymember` ADD CONSTRAINT `accounts_companymember_user_id_company_id_836528f5_uniq` UNIQUE (`user_id`, `company_id`);""",
    """ALTER TABLE `accounts_companymember` ADD CONSTRAINT `accounts_companymemb_company_id_3cf5589d_fk_accounts_` FOREIGN KEY (`company_id`) REFERENCES `accounts_company` (`id`);""",
    """ALTER TABLE `accounts_companymember` ADD CONSTRAINT `accounts_companymember_user_id_0612eae2_fk_accounts_user_id` FOREIGN KEY (`user_id`) REFERENCES `accounts_user` (`id`);"""
]

with connection.cursor() as cursor:
    for sql in sqls:
        try:
            cursor.execute(sql)
            print("Executed:", sql[:50])
        except Exception as e:
            print("Error on:", sql[:50], e)

