import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Send, Loader2, CheckCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function AskAISection() {
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState(null);

  const askAIMutation = useMutation({
    mutationFn: async (question) => {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a college admissions advisor helping a high school student. Answer their question with practical, encouraging advice. Keep it conversational and helpful.

Student's question: ${question}

Provide a clear, actionable answer in 2-3 paragraphs. Be supportive and realistic.`,
        add_context_from_internet: false
      });
      return result;
    },
    onSuccess: (data) => {
      setResponse(data);
    }
  });

  const handleAsk = () => {
    if (question.trim()) {
      askAIMutation.mutate(question);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <Card className="border-2 border-purple-200 bg-gradient-to-br from-white to-purple-50 shadow-xl">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-2xl">Ask AI Advisor</CardTitle>
              <p className="text-sm text-gray-600 mt-1">Get instant personalized advice powered by AI</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <Textarea
              placeholder="Ask anything... like 'How do I balance sports and academics?' or 'What makes a college essay stand out?'"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={4}
              className="resize-none text-lg border-2 focus:border-purple-500"
              disabled={askAIMutation.isPending}
            />
            <div className="flex items-center justify-between mt-3">
              <div className="flex gap-2">
                <Badge variant="outline" className="text-xs">
                  💡 Study tips
                </Badge>
                <Badge variant="outline" className="text-xs">
                  📝 Essay help
                </Badge>
                <Badge variant="outline" className="text-xs">
                  🎯 College selection
                </Badge>
              </div>
              <Button
                onClick={handleAsk}
                disabled={!question.trim() || askAIMutation.isPending}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {askAIMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Thinking...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Ask AI
                  </>
                )}
              </Button>
            </div>
          </div>

          <AnimatePresence>
            {response && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-6 p-6 bg-white rounded-xl border-2 border-purple-200"
              >
                <div className="flex items-center gap-2 mb-4 pb-3 border-b">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="font-semibold text-gray-900">AI Advisor's Response</span>
                </div>
                <div className="prose prose-purple max-w-none">
                  <ReactMarkdown>{response}</ReactMarkdown>
                </div>
                
                <div className="mt-4 pt-4 border-t text-xs text-gray-500">
                  💡 This is AI-generated advice. For personalized guidance, consider connecting with a human coach.
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {askAIMutation.isError && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
            >
              Something went wrong. Please try again.
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.section>
  );
}