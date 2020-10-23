from django import forms
from .models import Device


class newDevice(forms.ModelForm):
    class Meta:
        model = Device
        fields = ['index', 'amount', 'description', 'location', 'location_prec', 'container',
                  'category', 'brand', 'price', 'store', 'comments', 'date']
        widgets = {
            'description': forms.TextInput(attrs={'size': '40'}),
            'location': forms.TextInput(attrs={'size': '30'}),
            'location_prec': forms.TextInput(attrs={'size': '30'}),
            'container': forms.TextInput(attrs={'size': '30'}),
            'category': forms.Textarea(attrs={'cols': '30', 'rows': '3'}),
            'brand': forms.TextInput(attrs={'size': '40'}),
            'store': forms.TextInput(attrs={'size': '40'}),
            'comments': forms.TextInput(attrs={'size': '40'}),
        }
