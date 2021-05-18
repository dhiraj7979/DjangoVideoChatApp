from channels.generic.websocket import WebsocketConsumer

import json
from time import sleep
from random import randint

msglist = []
users = {"defaultUser":{"name":"default", "object":None},}

def myLogin():
    print("User Connected")

class WSConsumer(WebsocketConsumer):
    name = None
    otherName = None

    def sendTo(self, connection, message):
        if connection != self:
            connection["object"].send(json.dumps(message))
        else:
            self.send(json.dumps(message))


    def connect(self):
        print(f"CoderLog>> Websocket connected.")
        self.accept()
        # self.send(text_data="Hello bhai!")
        self.disconnect(code=1005)
    

    def disconnect(self, code):
        print(f"CoderLog>> Websocket disconnected.")


    def receive(self, text_data = None, bytes_data = None):
        data = None

        # Accepting only JSON messages.
        try:
            data = json.loads(text_data)
        except:
            print("Invalid JSON from client.")
            data = {}
        
        # When a user tries to login.
        if(data["type"] == "login"):
            print("User logged "+data["name"])

            # if anyone is logged in with this user name then refuse.
            if(data["name"] in users):
                self.send(json.dumps({
                    "type": "login",
                    "success": False
                }))
            else:
                # save user connection on the server.
                users[data["name"]] = {"name": data["name"], "object": self}
                self.name = data["name"]

                # users.append(data[name])

                self.send(json.dumps({
                    "type": "login",
                    "success": True,
                    "username": self.name
                }))

        # To handle offers...
        elif(data["type"] == "offer"):
            # for ex. UserA wants to call UserB
            print("Sending offer to " + data["name"])

            # if UserB exists then send him offer details
            conn = users[data["name"]] if (data["name"] in users)  else  None

            if conn != None:
                # setting that UserA connected with UserB
                self.otherName = data["name"]

                self.sendTo(conn, {
                    "type": "offer",
                    "offer": data["offer"],
                    "name": self.name
                })
                
        elif(data["type"] == "answer"):
            print("Sending answer to: "+data["name"])
            # for eg. UserB answers UserA
            conn = users[data["name"]] if (data["name"] in users) else None

            if conn != None:
                self.otherName = data["name"]
                self.sendTo(conn, {
                    "type": "answer",
                    "answer": data["answer"]
                })

        elif(data["type"] == "candidate"):
            print("sending candidate to: "+ data["name"])
            conn = users[data["name"]] if (data["name"] in users) else None

            if conn != None:
                self.sendTo(conn, {
                    "type": "candidate",
                    "candidate": data["candidate"]
                })

        elif(data["type"] == "leave"):
            print("disconnecting from: "+ data["name"])
            conn = users[data["name"]] if (data["name"] in users) else None
            self.otherName = None

            # Notify the other user so he can disconnect
            if conn != None:
                self.sendTo(conn, {
                    "type": "leave"
                })

        elif(data["type"] == "chat"):
            print("User: " + data["username"] + " sent chat msg: " + data["chatContent"])
            conn = users[data["name"]] if (data["name"] in users) else None

            if conn != None:
                self.sendTo(conn, {
                    "type": "chat",
                    "username": data["username"],
                    "chatContent": data["chatContent"]
                })
            
        else:
            self.sendTo(self, {
                "type": "error",
                "message": "Command not found. "+ data["type"]
            })


        
        # if text_data is not None:
        #     print(f"Message from client>> {text_data}");
        #     msglist.append(text_data)
        #     self.send(text_data=text_data)
        # else:
        #     print(f"No data sent...")
        
        # self.disconnect(1005)


