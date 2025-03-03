"use client";

import { useState, useEffect, useRef } from "react";
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
import { useAuth } from "@/context/AuthProvider"; // Import auth context

// Initialize WebSocket connection
const socket = io(process.env.NEXT_PUBLIC_API_BASE);

// Common country codes
const countryCodes = [
  { code: "+1", country: "United States" },
  { code: "+44", country: "United Kingdom" },
  { code: "+91", country: "India" },
  { code: "+61", country: "Australia" },
  { code: "+86", country: "China" },
  { code: "+81", country: "Japan" },
  { code: "+49", country: "Germany" },
  { code: "+33", country: "France" },
  { code: "+39", country: "Italy" },
  { code: "+7", country: "Russia" },
  { code: "+65", country: "Singapore" },
  { code: "+60", country: "Malaysia" },
  { code: "+62", country: "Indonesia" },
].sort((a, b) => a.country.localeCompare(b.country));

export default function VoiceCall() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+1");
  const [callActive, setCallActive] = useState(false);
  const [muted, setMuted] = useState(false);
  const [speaker, setSpeaker] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [callSid, setCallSid] = useState(null);
  const audioRef = useRef(null);
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
    // 🔊 Listen for live audio data from WebSocket
    socket.on("audio", (audioData) => {
      if (audioRef.current) {
        audioRef.current.srcObject = audioData;
      }
    });

    return () => socket.off("audio");
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
      // ✅ Check if user is authenticated
      if (!user || !token) {
        alert("You must be logged in to make a call.");
        return;
      }

      // ✅ Check if user has enough credits
      if (user.call_credits < 60) {
        alert("Not enough credits to start a call. Please top up.");
        return;
      }

      // ✅ Make the call
      const callRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/phone/call`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            phoneNumber: `${countryCode}${phoneNumber}`,
            userId: user.id,
          }),
        }
      );

      const callData = await callRes.json();
      if (callData.callSid) {
        setCallSid(callData.callSid);
        setCallActive(true);
      } else {
        console.error("Call failed:", callData.error);
      }
    } catch (error) {
      console.error("❌ Call error:", error);
    }
  };

  const handleEndCall = async () => {
    if (!callSid) return;

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/hangup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ callSid }),
      });

      setCallActive(false);
      setCallSid(null);
    } catch (error) {
      console.error("❌ Error ending call:", error);
    }
  };

  const toggleMute = () => {
    setMuted((prev) => !prev);
  };

  const toggleSpeaker = () => {
    setSpeaker((prev) => !prev);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center  p-4">
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
                    {countryCodes.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        {country.country} ({country.code})
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

              <audio ref={audioRef} controls autoPlay />

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
