# Generated by Django 5.1.7 on 2025-05-05 11:18

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='SQLExecution',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('user', models.CharField(max_length=100)),
                ('bbdd', models.CharField(max_length=100)),
                ('query', models.TextField()),
                ('executed_at', models.DateTimeField(auto_now_add=True)),
            ],
        ),
    ]
