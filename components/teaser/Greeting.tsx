"use client";

import { useEffect, useState } from "react";
import { greeting } from "@/lib/gestionale/data";

/** Il saluto della testata, calcolato nel browser (la home è una pagina statica). */
export function Greeting() {
  const [text, setText] = useState("Ave");
  useEffect(() => setText(greeting()), []);
  return <>{text}</>;
}
