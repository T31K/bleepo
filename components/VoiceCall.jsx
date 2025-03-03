"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthProvider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Phone,
  X,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  UserRound,
  Delete,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import io from "socket.io-client";

export default function VoiceCall() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+1");
  const [callActive, setCallActive] = useState(false);
  const [muted, setMuted] = useState(false);
  const [speaker, setSpeaker] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [callSid, setCallSid] = useState(null);
  const [socket, setSocket] = useState(null);
  const audioRef = useRef(null); // ✅ Initialize with useRef()
  const { user, token } = useAuth();

  useEffect(() => {
    let interval = null;
    if (callActive) {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [callActive]);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(); // ✅ Initialize only once
      audioRef.current.autoplay = true;
    }
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleNumberClick = (num) => {
    if (phoneNumber.length < 15 && !callActive) {
      setPhoneNumber((prev) => prev + num);
    }
  };

  const handleDelete = () => {
    setPhoneNumber((prev) => prev.slice(0, -1));
  };

  const handleCall = async () => {
    if (phoneNumber.length === 0) return;

    try {
      if (!user || !token) {
        alert("You must be logged in to make a call.");
        return;
      }

      if (user.call_credits < 60) {
        alert("Not enough credits to start a call. Please top up.");
        return;
      }

      const callRes = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE}/phone/call`,
        {
          phoneNumber: `${countryCode}${phoneNumber}`,
          userId: user.id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (callRes.data.callSid) {
        setCallSid(callRes.data.callSid);
        setCallActive(true);

        const newSocket = io(process.env.NEXT_PUBLIC_API_BASE);
        newSocket.on("audio", (audioData) => {
          if (audioRef.current) {
            const audioBlob = new Blob([audioData], { type: "audio/wav" });
            const audioUrl = URL.createObjectURL(audioBlob);
            audioRef.current.src = audioUrl;
            audioRef.current.play();
          }
        });

        setSocket(newSocket);
      } else {
        console.error("Call failed:", callRes.data.error);
      }
    } catch (error) {
      console.error("❌ Call error:", error.response?.data || error.message);
    }
  };

  const handleEndCall = async () => {
    if (!callSid) return;

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE}/phone/hangup`,
        { callSid },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCallActive(false);
      setCallSid(null);

      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
    } catch (error) {
      console.error(
        "❌ Error ending call:",
        error.response?.data || error.message
      );
    }
  };

  const toggleMute = () => {
    setMuted((prev) => !prev);
    if (audioRef.current) audioRef.current.muted = !audioRef.current.muted;
  };

  const toggleSpeaker = () => {
    setSpeaker((prev) => !prev);
    if (audioRef.current) audioRef.current.volume = speaker ? 1.0 : 0.5;
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        {!callActive ? (
          <>
            <CardHeader className="text-center space-y-4">
              <div className="flex items-center justify-center space-x-4">
                <Select value={countryCode} onValueChange={setCountryCode}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      { code: "+1", label: "US" },
                      { code: "+44", label: "UK" },
                      { code: "+91", label: "IN" },
                      { code: "+61", label: "AU" },
                      { code: "+86", label: "CN" },
                      { code: "+81", label: "JP" },
                      { code: "+49", label: "DE" },
                      { code: "+33", label: "FR" },
                      { code: "+39", label: "IT" },
                      { code: "+34", label: "ES" },
                      { code: "+93", label: "AF" }, // Afghanistan
                      { code: "+973", label: "BH" }, // Bahrain
                      { code: "+880", label: "BD" }, // Bangladesh
                      { code: "+975", label: "BT" }, // Bhutan
                      { code: "+673", label: "BN" }, // Brunei
                      { code: "+855", label: "KH" }, // Cambodia
                      { code: "+86", label: "CN" }, // China
                      { code: "+91", label: "IN" }, // India
                      { code: "+62", label: "ID" }, // Indonesia
                      { code: "+98", label: "IR" }, // Iran
                      { code: "+964", label: "IQ" }, // Iraq
                      { code: "+81", label: "JP" }, // Japan
                      { code: "+962", label: "JO" }, // Jordan
                      { code: "+7", label: "KZ" }, // Kazakhstan
                      { code: "+965", label: "KW" }, // Kuwait
                      { code: "+996", label: "KG" }, // Kyrgyzstan
                      { code: "+856", label: "LA" }, // Laos
                      { code: "+961", label: "LB" }, // Lebanon
                      { code: "+960", label: "MV" }, // Maldives
                      { code: "+976", label: "MN" }, // Mongolia
                      { code: "+95", label: "MM" }, // Myanmar
                      { code: "+977", label: "NP" }, // Nepal
                      { code: "+968", label: "OM" }, // Oman
                      { code: "+92", label: "PK" }, // Pakistan
                      { code: "+970", label: "PS" }, // Palestine
                      { code: "+63", label: "PH" }, // Philippines
                      { code: "+974", label: "QA" }, // Qatar
                      { code: "+82", label: "KR" }, // South Korea
                      { code: "+94", label: "LK" }, // Sri Lanka
                      { code: "+963", label: "SY" }, // Syria
                      { code: "+886", label: "TW" }, // Taiwan
                      { code: "+66", label: "TH" }, // Thailand
                      { code: "+90", label: "TR" }, // Turkey
                      { code: "+993", label: "TM" }, // Turkmenistan
                      { code: "+971", label: "AE" }, // United Arab Emirates
                      { code: "+998", label: "UZ" }, // Uzbekistan
                      { code: "+84", label: "VN" }, // Vietnam
                      { code: "+967", label: "YE" }, // Yemen
                      { code: "+60", label: "MY" }, // Malaysia
                    ].map(({ code, label }) => (
                      <SelectItem key={code} value={code}>
                        {label} {code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex-1 relative">
                  <div className="text-3xl font-bold tracking-wider flex items-center justify-center">
                    <span className="text-muted-foreground mr-2">
                      {countryCode}
                    </span>
                    <span>{phoneNumber}</span>
                    {phoneNumber.length > 0 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="ml-2 h-8 w-8"
                        onClick={handleDelete}
                      >
                        <Delete className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {[
                  "1",
                  "2",
                  "3",
                  "4",
                  "5",
                  "6",
                  "7",
                  "8",
                  "9",
                  "*",
                  "0",
                  "#",
                ].map((num) => (
                  <Button
                    key={num}
                    variant="outline"
                    className="h-16 text-2xl"
                    onClick={() => handleNumberClick(num)}
                  >
                    {num}
                  </Button>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button
                variant="default"
                size="icon"
                className="h-16 w-16 rounded-full bg-green-500 hover:bg-green-600"
                onClick={handleCall}
                disabled={phoneNumber.length === 0}
              >
                <Phone className="h-8 w-8" />
              </Button>
            </CardFooter>
          </>
        ) : (
          <div className="p-8">
            <div className="flex flex-col items-center space-y-6">
              <Avatar className="h-32 w-32 bg-primary/10">
                <AvatarFallback className="text-5xl">
                  <UserRound className="h-20 w-20 text-primary" />
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">
                  {countryCode} {phoneNumber}
                </h2>
                <div className="text-lg font-medium text-green-500">
                  Call in progress
                </div>
                <div className="text-2xl font-bold mt-4">
                  {formatTime(callDuration)}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-8 w-full mt-8">
                <Button onClick={toggleMute}>
                  {muted ? <MicOff /> : <Mic />}
                </Button>
                <Button variant="destructive" onClick={handleEndCall}>
                  <X />
                </Button>
                <Button onClick={toggleSpeaker}>
                  {speaker ? <Volume2 /> : <VolumeX />}
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
