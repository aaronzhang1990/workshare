#!/usr/bin/env python
# -*- coding: utf-8 -*-

from django.forms import Form, FileField

class UploadForm(Form):
    file = FileField(required=True)