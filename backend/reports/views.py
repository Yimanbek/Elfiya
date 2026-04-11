from django.db import connection
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from .queries import REPORTS_SQL

class DynamicReportView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request, report_slug):
        query = REPORTS_SQL.get(report_slug)
        if not query:
            return Response({"error": "Отчет не найден"}, status=404)

        needs_dates = '%s' in query 

        if needs_dates:
            start_date = request.query_params.get('start')
            end_date = request.query_params.get('end')
            
            if not start_date or not end_date:
                return Response({"error": "Укажите период (start, end)"}, status=400)
                
            params = [start_date, end_date]
        else:
            params = []

        with connection.cursor() as cursor:
            cursor.execute(query, params)
            
            columns = [col[0] for col in cursor.description]
            data = [dict(zip(columns, row)) for row in cursor.fetchall()]

        return Response({
            "report_name": report_slug,
            "data": data
        })