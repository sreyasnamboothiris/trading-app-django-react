from django.apps import AppConfig


class MpadminConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'mpadmin'
# def handle_exception(e):
#     exc_type, exc_obj, tb = sys.exc_info()
#     line_no = tb.tb_lineno
#     return Response({"status": False, "message": f"Error: {str(e)} at line {line_no}"}, status=status.HTTP_400_BAD_REQUEST)
# except Exception as e:
#         return handle_exception(e)