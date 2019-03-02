#!/usr/bin/python3
import sys

#print ('Number of arguments:', len(sys.argv), 'arguments.')
#print ('Argument List:', str(sys.argv[1]))
#try:
if(sys.argv[1]=='SLED'):
	from neopixel import *
	# LED strip configuration:
	LED_COUNT      = 1       # Number of LED pixels.
	LED_PIN        = 12      # GPIO pin connected to the pixels (must support PWM!).
	LED_FREQ_HZ    = 800000  # LED signal frequency in hertz (usually 800khz)
	LED_DMA        = 5       # DMA channel to use for generating signal (try 5)
	LED_BRIGHTNESS = 255     # Set to 0 for darkest and 255 for brightest
	LED_INVERT     = False   # True to invert the signal (when using NPN transistor level shift)
	# Create NeoPixel object with appropriate configuration.
	strip = Adafruit_NeoPixel(LED_COUNT, LED_PIN, LED_FREQ_HZ, LED_DMA, LED_INVERT, LED_BRIGHTNESS)
	# Intialize the library (must be called once before other functions).
	strip.begin()
	strip.setPixelColor(0, Color(int(sys.argv[2]),int(sys.argv[3]),int(sys.argv[4])))
	strip.show()
elif(sys.argv[1]=='gettemp'):
	import dht22
	import RPi.GPIO as GPIO
	# initialize GPIO
	GPIO.setwarnings(False)
	GPIO.setmode(GPIO.BCM)
	instance = dht22.DHT22(pin=int(sys.argv[2]))
	read_sum = 0
	while 1:
		result=instance.read()
		if result.is_valid():
			print("{:.2f}".format(result.temperature))
			break
		read_sum += 1
		if(read_sum>6):
			print(-1)
			break
elif(sys.argv[1]=='gethum'):
	import dht22
	import RPi.GPIO as GPIO
	# initialize GPIO
	GPIO.setwarnings(False)
	GPIO.setmode(GPIO.BCM)
	instance = dht22.DHT22(pin=int(sys.argv[2]))
	read_sum = 0
	while 1:
		result = instance.read()
		if result.is_valid():
			print("{:.2f}".format(result.humidity))
			break
		read_sum += 1
		if(read_sum>6):
			print(-1)
			break
elif(sys.argv[1]=='getjoy'):
	import RPi.GPIO as GPIO
	# initialize GPIO
	GPIO.setwarnings(False)
	GPIO.setmode(GPIO.BCM)
	#GPIO.cleanup()
	GPIO.setup(int(sys.argv[2]), GPIO.IN, pull_up_down=GPIO.PUD_UP) # Button pin set as input w/ pull-up
	if(GPIO.input(int(sys.argv[2]))==0):
		print('1')
	else:
		print('0')
elif(sys.argv[1]=='oledbegin'):
	import Adafruit_SSD1306
	disp = Adafruit_SSD1306.SSD1306_128_64(rst=1)
	disp.begin()
elif(sys.argv[1]=='showoled'):
	import os
	from PIL import Image,ImageDraw,ImageFont
	import Adafruit_SSD1306
	import json
	dirpath = os.path.dirname(__file__)
	# 128x64 display with hardware I2C:
	disp = Adafruit_SSD1306.SSD1306_128_64(rst=1)
	# Note you can change the I2C address by passing an i2c_address parameter like:
	# disp = Adafruit_SSD1306.SSD1306_128_64(rst=RST, i2c_address=0x3C)
	# Initialize library.
	#disp.begin()
	# Clear display.
	#disp.clear()
	#disp.display()
	width = disp.width
	height = disp.height  
	image = Image.new('1', (width, height))
	draw = ImageDraw.Draw(image)
	cmd=''
	for x in sys.argv[2:]:
		s= (x + ' ')
		cmd += s
	cmd_str = cmd.replace("'", "\"")
	#h='{"d":[{"x":1,"y":2,"t":"t ext","s":10},{"x":1,"y":2,"t":"t ext","s":10}]}'
	print(cmd_str)
	y = json.loads(cmd_str)
	for j in y['oled']:
		#print(j['x'],j['y'],j['t'],j['s'])
		font = ImageFont.truetype(dirpath+'/VCR_OSD_MONO_1.001.ttf',j['s'])
		draw.text((int(j['x']),int(j['y'])), j['t'],font=font, fill=1)
	disp.image(image)
	disp.display()
elif(sys.argv[1]=='exit'):
	from neopixel import *
	# LED strip configuration:
	LED_COUNT      = 1       # Number of LED pixels.
	LED_PIN        = 12      # GPIO pin connected to the pixels (must support PWM!).
	LED_FREQ_HZ    = 800000  # LED signal frequency in hertz (usually 800khz)
	LED_DMA        = 5       # DMA channel to use for generating signal (try 5)
	LED_BRIGHTNESS = 255     # Set to 0 for darkest and 255 for brightest
	LED_INVERT     = False   # True to invert the signal (when using NPN transistor level shift)
	# Create NeoPixel object with appropriate configuration.
	strip = Adafruit_NeoPixel(LED_COUNT, LED_PIN, LED_FREQ_HZ, LED_DMA, LED_INVERT, LED_BRIGHTNESS)
	# Intialize the library (must be called once before other functions).
	strip.begin()
	strip.setPixelColor(0, Color(0, 0, 0))
	strip.show()
#except:
#	print

