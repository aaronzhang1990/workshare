#!/usr/bin/env python
# -*- coding: utf-8 -*-

from django.http import *
from .forms import UploadForm
import json
from django.shortcuts import render_to_response
def any_upload(req):
    if req.method == 'POST':
        fm = UploadForm(req.POST, req.FILES)
        if fm.is_valid():
            data = {'success': True}
            data['msg'] = req.FILES['file'].read()
            return HttpResponse(json.dumps(data), content_type="application/json")
        else:
            return HttpResponse('{"success": false, "msg": "form invalid"}', content_type="application/json")
    elif req.method == 'GET':
        return render_to_response('index.html')