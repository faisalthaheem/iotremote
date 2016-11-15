[![Build Status](https://travis-ci.org/faisalthaheem/iotremote.png?branch=master)](https://travis-ci.org/faisalthaheem/iotremote)

# iotremote
An IONIC app using MQTT to control connected devices in addition to providing an interface to the [IoT Home - ESP8266 Based Home Automation System](https://github.com/faisalthaheem/iothome) for managing schedules and tapping into other metrics reported there.

The project is built using [Ionic Framework](http://ionicframework.com/) and uses [Eclipse PahoJS](https://eclipse.org/paho/clients/js/) to talk to the [message broker Mosquitto](https://mosquitto.org/).

To run on android, setup your development environment and then issue the following commands with your device connected (with developer mode turned on and your pc authorized for adb connections)
```bash
ionic platform add android
ionic run
```


----------


![enter image description here](http://i.imgur.com/p1yo5O3.png)
