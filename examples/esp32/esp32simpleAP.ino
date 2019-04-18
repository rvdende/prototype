#include "WiFi.h"
#include <Preferences.h>

#define AP_SSID "PrototypeESP32" //can set ap hostname here

WiFiServer server(80);
Preferences preferences;
static volatile bool wifi_connected = false;
String wifiSSID, wifiPassword;

void WiFiEvent(WiFiEvent_t event)
{
  switch (event)
  {

  case SYSTEM_EVENT_AP_START:
    //can set ap hostname here
    WiFi.softAPsetHostname(AP_SSID);
    //enable ap ipv6 here
    WiFi.softAPenableIpV6();
    break;

  case SYSTEM_EVENT_STA_START:
    //set sta hostname here
    WiFi.setHostname(AP_SSID);
    break;
  case SYSTEM_EVENT_STA_CONNECTED:
    //enable sta ipv6 here
    WiFi.enableIpV6();
    break;
  case SYSTEM_EVENT_AP_STA_GOT_IP6:
    //both interfaces get the same event
    Serial.print("STA IPv6: ");
    Serial.println(WiFi.localIPv6());
    Serial.print("AP IPv6: ");
    Serial.println(WiFi.softAPIPv6());
    break;
  case SYSTEM_EVENT_STA_GOT_IP:
    wifiOnConnect();
    wifi_connected = true;
    break;
  case SYSTEM_EVENT_STA_DISCONNECTED:
    wifi_connected = false;
    wifiOnDisconnect();
    break;
  default:
    break;
  }
}

String urlDecode(const String &text)
{
  String decoded = "";
  char temp[] = "0x00";
  unsigned int len = text.length();
  unsigned int i = 0;
  while (i < len)
  {
    char decodedChar;
    char encodedChar = text.charAt(i++);
    if ((encodedChar == '%') && (i + 1 < len))
    {
      temp[2] = text.charAt(i++);
      temp[3] = text.charAt(i++);

      decodedChar = strtol(temp, NULL, 16);
    }
    else
    {
      if (encodedChar == '+')
      {
        decodedChar = ' ';
      }
      else
      {
        decodedChar = encodedChar; // normal ascii char
      }
    }
    decoded += decodedChar;
  }
  return decoded;
}

void setup()
{
  Serial.begin(115200);
  WiFi.onEvent(WiFiEvent);
  WiFi.mode(WIFI_MODE_APSTA);
  WiFi.softAP(AP_SSID);
  Serial.println("AP Started");
  Serial.print("AP SSID: ");
  Serial.println(AP_SSID);
  Serial.print("AP IPv4: ");
  Serial.println(WiFi.softAPIP());

  preferences.begin("wifi", false);
  wifiSSID = preferences.getString("ssid", "none");         //NVS key ssid
  wifiPassword = preferences.getString("password", "none"); //NVS key password
  preferences.end();
  Serial.print("Stored SSID: ");
  Serial.println(wifiSSID);

  WiFi.begin(wifiSSID.c_str(), wifiPassword.c_str());

  server.begin();
}

void loop()
{
  if (wifi_connected)
  {
    wifiConnectedLoop();
  }
  else
  {
    wifiDisconnectedLoop();
  }
}

//when wifi connects
void wifiOnConnect()
{
  Serial.println("STA Connected");
  Serial.print("STA SSID: ");
  Serial.println(WiFi.SSID());
  Serial.print("STA IPv4: ");
  Serial.println(WiFi.localIP());
  Serial.print("STA IPv6: ");
  Serial.println(WiFi.localIPv6());
  WiFi.mode(WIFI_MODE_STA); //close AP network
}

//when wifi disconnects
void wifiOnDisconnect()
{
  Serial.println("STA Disconnected");
  delay(1000);
  WiFi.begin(wifiSSID.c_str(), wifiPassword.c_str());
}

//while wifi is connected
void wifiConnectedLoop()
{
  Serial.print("RSSI: ");
  Serial.println(WiFi.RSSI());
  delay(1000);
}

void wifiDisconnectedLoop()
{
  WiFiClient client = server.available(); // listen for incoming clients

  if (client)
  {                               // if you get a client,
    Serial.println("New client"); // print a message out the serial port
    String currentLine = "";      // make a String to hold incoming data from the client
    while (client.connected())
    { // loop while the client's connected
      if (client.available())
      {                         // if there's bytes to read from the client,
        char c = client.read(); // read a byte, then
        Serial.write(c);        // print it out the serial monitor
        if (c == '\n')
        { // if the byte is a newline character

          // if the current line is blank, you got two newline characters in a row.
          // that's the end of the client HTTP request, so send a response:
          if (currentLine.length() == 0)
          {
            // HTTP headers always start with a response code (e.g. HTTP/1.1 200 OK)
            // and a content-type so the client knows what's coming, then a blank line:
            client.println("HTTP/1.1 200 OK");
            client.println("Content-type:text/html");
            client.println();

            // the content of the HTTP response follows the header:
            client.print("<form method='get' action='a'><label>SSID: </label><input name='ssid' length=32><input name='pass' length=64><input type='submit'></form>");

            // The HTTP response ends with another blank line:
            client.println();
            // break out of the while loop:
            break;
          }
          else
          { // if you got a newline, then clear currentLine:
            currentLine = "";
          }
        }
        else if (c != '\r')
        {                   // if you got anything else but a carriage return character,
          currentLine += c; // add it to the end of the currentLine
          continue;
        }

        if (currentLine.startsWith("GET /a?ssid="))
        {
          //Expecting something like:
          //GET /a?ssid=blahhhh&pass=poooo
          Serial.println("");
          Serial.println("Cleaning old WiFi credentials from ESP32");
          // Remove all preferences under opened namespace
          preferences.clear();

          String qsid;
          qsid = urlDecode(currentLine.substring(12, currentLine.indexOf('&'))); //parse ssid
          Serial.println(qsid);
          Serial.println("");
          String qpass;
          qpass = urlDecode(currentLine.substring(currentLine.lastIndexOf('=') + 1, currentLine.lastIndexOf(' '))); //parse password
          Serial.println(qpass);
          Serial.println("");

          preferences.begin("wifi", false); // Note: Namespace name is limited to 15 chars
          Serial.println("Writing new ssid");
          preferences.putString("ssid", qsid);

          Serial.println("Writing new pass");
          preferences.putString("password", qpass);
          delay(300);
          preferences.end();

          client.println("HTTP/1.1 200 OK");
          client.println("Content-type:text/html");
          client.println();

          // the content of the HTTP response follows the header:
          client.print("<h1>OK! Restarting in 5 seconds...</h1>");
          client.println();
          Serial.println("Restarting in 5 seconds...");
          delay(5000);
          ESP.restart();
        }
      }
    }
    // close the connection:
    client.stop();
    Serial.println("client disconnected");
  }
}