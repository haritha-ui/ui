from django.contrib import admin

from hst_ct_app.models import Tests
from hst_ct_app.models import Utilities

# Register your models here.
@admin.register(Tests)
class TestViewAdmin(admin.ModelAdmin):
  list_display = [field.name for field in Tests._meta.get_fields()]

@admin.register(Utilities)
class UtilitiesViewAdmin(admin.ModelAdmin):
  list_display = [field.name for field in Utilities._meta.get_fields()]