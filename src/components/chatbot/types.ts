export interface MessagesProps {
  from: string;
  text: string;
  tag: string;
  images?: string[];
  sources?: Source[];
  suggestions?: string[];
}

export interface Source {
  id: number;
  logo: string;
  name: string;
  url: string;
  title: string;
  snippet: string;
}
