
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Mic, 
  MicOff, 
  Camera, 
  CameraOff, 
  Monitor, 
  MonitorOff,
  Volume2,
  VolumeX,
  Settings,
  Users
} from "lucide-react";

interface LessonVideoCallProps {
  lessonId: string;
}

export const LessonVideoCall = ({ lessonId }: LessonVideoCallProps) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isSharingScreen, setIsSharingScreen] = useState(false);
  const [isSpeakerOff, setIsSpeakerOff] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    startLocalVideo();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startLocalVideo = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Error accessing media devices:', error);
    }
  };

  const toggleMute = () => {
    if (stream) {
      stream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleCamera = () => {
    if (stream) {
      stream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsCameraOff(!isCameraOff);
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (!isSharingScreen) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });
        if (videoRef.current) {
          videoRef.current.srcObject = screenStream;
        }
        setIsSharingScreen(true);
      } else {
        await startLocalVideo();
        setIsSharingScreen(false);
      }
    } catch (error) {
      console.error('Error sharing screen:', error);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 bg-black rounded-lg overflow-hidden relative">
        <video
          ref={videoRef}
          autoPlay
          muted
          className="w-full h-full object-cover"
        />
        
        {isCameraOff && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
            <div className="text-center text-white">
              <CameraOff className="h-12 w-12 mx-auto mb-2" />
              <p>Камера выключена</p>
            </div>
          </div>
        )}

        {/* Remote participant placeholder */}
        <div className="absolute top-4 right-4 w-32 h-24 bg-gray-700 rounded-lg border-2 border-white">
          <div className="w-full h-full flex items-center justify-center text-white text-xs">
            <Users className="h-6 w-6" />
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-center space-x-2">
        <Button
          variant={isMuted ? "destructive" : "outline"}
          size="sm"
          onClick={toggleMute}
        >
          {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </Button>
        
        <Button
          variant={isCameraOff ? "destructive" : "outline"}
          size="sm"
          onClick={toggleCamera}
        >
          {isCameraOff ? <CameraOff className="h-4 w-4" /> : <Camera className="h-4 w-4" />}
        </Button>
        
        <Button
          variant={isSharingScreen ? "default" : "outline"}
          size="sm"
          onClick={toggleScreenShare}
        >
          {isSharingScreen ? <MonitorOff className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}
        </Button>
        
        <Button
          variant={isSpeakerOff ? "destructive" : "outline"}
          size="sm"
          onClick={() => setIsSpeakerOff(!isSpeakerOff)}
        >
          {isSpeakerOff ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </Button>
        
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
