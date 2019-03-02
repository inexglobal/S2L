new (function() {
    var ext = this;
    var net = require('net')
    var fs = require('fs')
    var Arr_cmd_oled = '\"{\'oled\':[';
    var index = 0;
    //var dirfile = 'sudo python3 /home/pi/Desktop/S2leafhat/leafhat.py';
    var dirfile = 'sudo python3 /usr/lib/scratch2/scratch_extensions/S2L/leafhat.py';
    
    //const {dialog} = require('electron').remote
    //const {BrowserWindow} = require('electron').remote

    // Cleanup function when the extension is unloaded
    ext._shutdown = function ()
    {
        require('child_process').execSync(dirfile + ' exit');
        var cpu = fs.readFileSync ("/proc/cpuinfo", 'utf8');
        if (cpu.indexOf ("ARM") != -1)
        {
            for (pin = 2; pin < 28; pin++)
            {
                if (fs.existsSync("/sys/class/gpio/gpio" + pin))
                    fs.writeFileSync("/sys/class/gpio/unexport", pin, "utf8");
            }
        }
    };

    // Status reporting code
    // Use this to report missing hardware, plugin or unsupported browser
    ext._getStatus = function ()
    {
        return {status: 2, msg: 'Ready'};
    };

    ext.set_gpio = function (pin, val) 
    {
        if (pin === '' || pin < 0 || pin > 27) return;

        var dir = 0, lev;
        if (val == 'output high') lev = 1;
        else if (val == 'output low') lev = 0;
        else dir = 1;

		// check the pin is exported
		if (!fs.existsSync("/sys/class/gpio/gpio" + pin)) 
			fs.writeFileSync("/sys/class/gpio/export", pin, "utf8");

		// the ownership of direction takes time to establish, so try this until it succeeds
		while (true)
		{
			try {
				fs.writeFileSync("/sys/class/gpio/gpio" + pin + "/direction", dir == 0 ? "out" : "in", "utf8");
				break;
			}
			catch (error) {
				continue;
			}
		}

		// set the output value
        if (dir == 0)
            fs.writeFileSync("/sys/class/gpio/gpio" + pin + "/value", lev == 1 ? "1" : "0", "utf8");
    };
  
    ext.get_gpio = function (pin) 
    {
        if (pin === '' || pin < 0 || pin > 27) return;

		// check the pin is exported
		if (!fs.existsSync("/sys/class/gpio/gpio" + pin)) 
			fs.writeFileSync("/sys/class/gpio/export", pin);

		// read the pin value
		var data = fs.readFileSync ("/sys/class/gpio/gpio" + pin + "/value", 'utf8');

		if (data.slice(0,1) == "1") return true;
		else return false;
    };
    ext.send_packet_cb = function (usb, cmd, p1, p2, p3, func)
    {
        var packet = new Buffer ([cmd,0,0,0,p1,0,0,0,p2,0,0,0,p3,0,0,0]);
        var s = new net.Socket();

        if (usb == 'local') addr = '127.0.0.1';
        else addr = 'fe80::1%' + usb;

        s.connect (8888, addr, function () {
            s.write (packet, function () {
                s.end ();
            });
        });

        s.on('data', function (data) {
            if (data[12] == 1) func (true);
            else func (false);
        });

        s.on('error', function (err) {
            func (false);
        });
    }

    ext.set_gpio_rem = function (usb, pin, val) 
    {
        if (pin === '' || pin < 0 || pin > 27) return;

        var dir = 1, lev;
        if (val == 'output high') lev = 1;
        else if (val == 'output low') lev = 0;
        else dir = 0;

        // set mode to input or output - command 0 = mode set
        ext.send_packet_cb (usb, 0, pin, dir, 0, function (data) { } );

        // if output, set level - command 4 = write
        if (dir == 1)
            ext.send_packet_cb (usb, 4, pin, lev, 0, function (data) { });
    };

    ext.get_gpio_rem = function (usb, pin, callback) 
    {
        if (pin === '' || pin < 0 || pin > 27)
        {
            callback (false);
            return;
        }

        // read pin value - command 3 = read
        ext.send_packet_cb (usb, 3, pin, 0, 0, callback);
    };
    ext.get_t = function (pin) 
    {
        return require('child_process').execSync(dirfile + ' gettemp '+pin).toString().trim();
        
    };
    ext.get_h = function (pin) 
    {
        return require('child_process').execSync(dirfile + ' gethum '+pin).toString().trim();
        
    };
      ext.map_colour = function (col)
    {
        if (col == 'off') return 0;
        else if (col == 'white') return 0x1CE7;
        else if (col == 'red') return 0x00E0;
        else if (col == 'green') return 0x0007;
        else if (col == 'blue') return 0x1C00;
        else if (col == 'magenta') return 0x1CE0;
        else if (col == 'yellow') return 0x00E7;
        else if (col == 'cyan') return 0x1C07;
        return 0;
    }
   ext.set_sled = function (r, g, b, t)
    {      var gg = g;
          if(t=='GRB'){
             g=r;
             r= gg;
            }
        //alert(dirfile + ' '+r+' '+g+' '+b);
         require('child_process').execSync(dirfile +' SLED' + ' '+r+' '+g+' '+b);
         //alert("test");
    }
    ext.set_oled = function (x, y, text , size)
    {   
        Arr_cmd_oled+='{\'x\':'+x+',\'y\':'+y+',\'t\':\''+text+'\',\'s\':'+size+'},';
        index++;
    }
    ext.begin_oled = function ()
    {   
        require('child_process').execSync(dirfile + ' oledbegin ');
    }
    ext.show_oled = function ()
    {   
        Arr_cmd_oled = Arr_cmd_oled.substring(0, Arr_cmd_oled.length-1);
        Arr_cmd_oled+=']}\"';
        //alert(Arr_cmd_oled);
        //alert(dirfile + ' showoled '+Arr_cmd_oled);
        require('child_process').execSync(dirfile + ' showoled '+ Arr_cmd_oled);
        Arr_cmd_oled = '\"{\'oled\':[';
        //alert(dirfile + ' showoled '+Arr_cmd_oled);
        index=0;
    }
    // Block and block menu descriptions
    var cpu = fs.readFileSync ("/proc/cpuinfo", 'utf8');
    if (cpu.indexOf ("ARM") != -1)
    {
        var descriptor = {
            blocks: [
                [' ', 'set gpio %m.gpios to %m.outputs', 'set_gpio', '', 'output high'],
                ['b', 'gpio %m.gpios is high?', 'get_gpio', ''],
                ['r', 'gpio %m.gpios temperature', 'get_t','4'],
                ['r', 'gpio %m.gpios humidity', 'get_h','4'],
                [' ', 'Show SLED to R %n G %n B %n Type %m.typeled', 'set_sled', '255', '255', '255','GRB'],
                [' ', 'OLED Begin', 'begin_oled',''],
                [' ', 'OLED x %n y %n Text %s Size %n ', 'set_oled','0','0','text','10'],
                [' ', 'OLED Show ', 'show_oled',''],
                
                
            ],
            menus: {
                outputs: ['output high', 'output low', 'input'],
                typeled: ['RGB','GRB'],
                direction: ['up', 'down', 'left', 'right','enter'],
                colour: ['off', 'red', 'green', 'blue', 'yellow', 'cyan', 'magenta', 'white'],
                gpios: ['0','1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24','25','26','27'],
           },
                url: 'https://github.com/inexglobal/'
        };
    }
    else
    {
        var descriptor = {
            blocks: [
                [' ', 'set remote %m.usb gpio %m.gpios to %m.outputs', 'set_gpio_rem', 'usb0', '', 'output high'],
                ['B', 'remote %m.usb gpio %m.gpios is high?', 'get_gpio_rem', 'usb0', ''],
            ],
            menus: {
                outputs: ['output high', 'output low', 'input'],
                usb: ['usb0', 'usb1', 'usb2', 'usb3'],
                gpios: ['0','1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24','25','26','27'],
            }
        };    
    }

    // Register the extension
    ScratchExtensions.register('LeafHAT', descriptor, ext);
})();
