export interface Document {
  id: string;
  name: string;
  content: string;
  chunks: DocumentChunk[];
  createdAt: Date;
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  content: string;
  embedding: number[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  documentContext?: string;
} 