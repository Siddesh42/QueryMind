import { Document, DocumentChunk } from '../types';
import crypto from 'crypto';

export async function processDocument(file: File): Promise<Document> {
  const content = await extractContent(file);
  const chunks = chunkContent(content);
  
  return {
    id: crypto.randomUUID(),
    name: file.name,
    content,
    chunks,
    createdAt: new Date()
  };
}

async function extractContent(file: File): Promise<string> {
  if (file.type === 'application/pdf') {
    const arrayBuffer = await file.arrayBuffer();
    // We'll handle PDF parsing in an API route
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('/api/parse-pdf', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error('Failed to parse PDF');
    }
    
    const { text } = await response.json();
    return text;
  } else {
    // For text files
    return await file.text();
  }
}

function chunkContent(content: string): DocumentChunk[] {
  // Split content into chunks of roughly 1000 characters
  const chunkSize = 1000;
  const chunks: DocumentChunk[] = [];
  
  for (let i = 0; i < content.length; i += chunkSize) {
    const chunkContent = content.slice(i, i + chunkSize);
    chunks.push({
      id: crypto.randomUUID(),
      documentId: '', // Will be set when document is created
      content: chunkContent,
      embedding: [] // Will be set when processed by LLM
    });
  }
  
  return chunks;
} 