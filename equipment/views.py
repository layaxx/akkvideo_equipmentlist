from datetime import datetime
from django.shortcuts import render, get_object_or_404
from django.http import HttpResponse, HttpResponseRedirect
from django.urls import reverse
from .forms import newDevice

from .models import Device


def index(request):
    return render(request, 'equipment/index.html', {'device_names': Device.objects.all()})


def detail(request, device_id):
    device = get_object_or_404(Device, pk=device_id)
    return render(request, 'equipment/add.html', {'form': newDevice(instance=device), 'new': False})


def add(request):
    # if this is a POST request we need to process the form data
    if request.method == 'POST':
        # create a form instance and populate it with data from the request:
        form = newDevice(request.POST)
        # check whether it's valid:
        if form.is_valid():
            # process the data in form.cleaned_data as required
            form.save()
            # redirect to a new URL:
            return HttpResponseRedirect('/equipment/')

    # if a GET (or any other method) we'll create a blank form
    else:
        form = newDevice()

    return render(request, 'equipment/add.html', {'form': newDevice(initial={'amount': '1', 'index': Device.objects.all().order_by('-index')[0].index + 1, 'location': 'Medienraum', 'date': datetime.today()}), 'new': True})


def added(request):
    try:
        new_device = Device()
        new_device.index = request.POST.get('index')
        new_device.amount = request.POST.get('amount', 1)
        new_device.description = request.POST.get('description')
        new_device.location = request.POST.get('location')
        new_device.location_prec = request.POST.get('location_prec', '')
        new_device.container = request.POST.get('container', '')
        new_device.category = request.POST.get('category')
        new_device.brand = request.POST.get('brand', '')
        new_device.price = request.POST.get('price')
        new_device.store = request.POST.get('store', '')
        new_device.comments = request.POST.get('comments', '')
        new_device.date = request.POST.get('date')

        new_device.set_id()
        new_device.save()
        return HttpResponseRedirect(reverse('detail', args=(new_device.id,)))
    except:
        return HttpResponse("failed to add device")
