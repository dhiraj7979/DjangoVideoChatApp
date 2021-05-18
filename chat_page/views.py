from django.shortcuts import render

# Create your views here.
def chat_page(request):
    # Implement your chat-page code here.
    return render(request, 'chat-page.html', context = {'data': 'no data to pass right now...'})