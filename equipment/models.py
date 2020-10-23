from django.db import models
from django.utils import timezone


class Device(models.Model):
    index = models.IntegerField('Index', null=False)
    amount = models.IntegerField('Menge', null=False)
    description = models.TextField('Bezeichnung', null=False)
    location = models.TextField('Standort (z.B. Medienraum)', null=False)
    location_prec = models.TextField(
        'genauerer Standort (z.B. Stahlschrank)', default="", blank=True)
    container = models.TextField(
        'Behälter (z.B. Tontasche)', default="", blank=True)
    category = models.TextField(
        'Kategorien (durch Komma getrennt)', default="Sonstiges")
    brand = models.TextField('Marke (z.B. Sony)', default="", blank=True)
    price = models.DecimalField(
        'Kaufpreis', null=False, max_digits=7, decimal_places=2)
    store = models.TextField('Geschäft', default="", blank=True)
    comments = models.TextField('Anmerkungen', default="", blank=True)
    history = models.TextField(default="")
    id = models.CharField(primary_key=True, max_length=6)
    date = models.DateField('Kaufdatum', null=False)
    verified = models.BooleanField(default=False)

    def __str__(self) -> str:
        return self.description


class Report(models.Model):
    timestamp = models.DateTimeField(
        'Timestamp of report creation', default=timezone.now)
    devices = models.IntegerField('Amount of devices in report')
    query = models.TextField('query for selected devices', default="")
    tex = models.TextField(null=False)
    id = models.CharField(max_length=8, primary_key=True)

    def __str__(self) -> str:
        return self.id
