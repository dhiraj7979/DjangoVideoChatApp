from django.http import HttpResponse
from django.shortcuts import render
import websockets
import asyncio


def index(request):
    return render(request, 'index.html')


def create_room(request):
    # ws server code here...
    #below code is for starting websockets (ws) server. It is to be setup with channels...
    # async def hello(websocket, path):
    #     name = await websocket.recv()
    #     print("< {}".format(name))

    #     greeting = "Hello {}!".format(name)
    #     await websocket.send(greeting)
    #     print("> {}".format(greeting))

    # start_server = websockets.serve(hello, 'localhost', 8765)

    # asyncio.get_event_loop().run_until_complete(start_server)
    # asyncio.get_event_loop().run_forever()

    return render(request, 'create-room.html')


def chat_page(request):
    return render(request, 'chat-page.html')


def about(request):
    return render(request, 'about.html')


def contact_us(request):
    return render(request, 'contact-us.html')


def video_page(request):
    return render(request, 'videoPage.html')