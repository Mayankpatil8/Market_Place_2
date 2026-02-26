import React from "react";
import { useParams } from "react-router-dom";

export default function ProductDetail() {
  const { id } = useParams();

  return (
    <div style={{ padding: 20, color: "#e8e8e2" }}>
      <h1>Product Detail</h1>
      <p>Product ID: {id}</p>
      <p>This page is under construction.</p>
    </div>
  );
}