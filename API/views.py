from django.shortcuts import render
from rest_framework.views import APIView
from django.views import View
from rest_framework.response import Response
from rest_framework.parsers import JSONParser
from django.http import JsonResponse
import numpy as np
import cv2
import base64
import pickle

# Load models
Pmodel = pickle.load(open('API/Pclassifier.pkl', 'rb'))
pHmodel = pickle.load(open('API/pHclassifier.pkl', 'rb'))
OMmodel = pickle.load(open('API/OMclassifier.pkl', 'rb'))
ECmodel = pickle.load(open('API/ECclassifier.pkl', 'rb'))

class PredictView(APIView):
    def post(self, request, *args, **kwargs):
        inputImage = request.data.get('inputImage')
        if inputImage:
            nparr = np.frombuffer(base64.b64decode(inputImage), np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

            # Extracting blue, red, green channel from color image
            blue_channel = image[:,:,0]
            green_channel = image[:,:,1]
            red_channel = image[:,:,2]
            temp = ((np.median(green_channel) + np.median(blue_channel)) + np.median(red_channel))
            temp = np.nanmean(temp)

            Presult = float(Pmodel.predict([[temp]]))
            pHresult = float(pHmodel.predict([[temp]]))
            OMresult = float(OMmodel.predict([[temp]]))
            ECresult = float(ECmodel.predict([[temp]]))

            result = {'P': Presult, 'pH': pHresult, 'OM': OMresult, 'EC': ECresult}
            return JsonResponse(result)
        return Response({"error": "No input image provided"}, status=400)

    def get(self, request, *args, **kwargs):
        return Response("API is succefully running")

class UploadImageView(View):
    def get(self, request):
        return render(request, 'predict.html')

    def post(self, request):
        uploaded_file = request.FILES['image']
        image = uploaded_file.read()
        encoded_image = base64.b64encode(image).decode('utf-8')
        
        # Make request to the API
        response = self.make_prediction(encoded_image)
        return render(request, 'predict.html', {'result': response})

    def make_prediction(self, encoded_image):
        import requests
        response = requests.post('http://localhost:8000/api/predict/', data={'inputImage': encoded_image})
        return response.json()

