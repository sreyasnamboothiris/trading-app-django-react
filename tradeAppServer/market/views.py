from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Asset
from .serializers import AssetSerializer


class AssetSearchView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        query = request.query_params.get('query', '')
        
        # Filter assets based on the search query (case insensitive)
        if query:
            assets = Asset.objects.filter(asset_name__istartswith=query)
        else:
            assets = Asset.objects.all()  # Return all assets if no query is provided

        # Serialize the assets data
        serializer = AssetSerializer(assets, many=True)

        # Return the full list of assets matching the query
        return Response(serializer.data)
