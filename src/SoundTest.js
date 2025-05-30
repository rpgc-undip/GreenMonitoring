import React from "react";

export default function SoundTest() {
  const handlePlay = () => {
    const audio = new Audio("/beep-beep.wav"); // Or .wav if you like
    audio.play().catch(err => console.error("Sound error:", err));
  };

  return <button onClick={handlePlay}>Play Beep</button>;
}
