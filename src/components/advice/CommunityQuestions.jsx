import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, ThumbsUp, Send, Loader2, Users } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

export default function CommunityQuestions() {
  const [showAskForm, setShowAskForm] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Other");
  const queryClient = useQueryClient();

  const { data: questions = [], isLoading } = useQuery({
    queryKey: ['community-questions'],
    queryFn: () => base44.entities.StudentQuestion.list('-created_date', 20),
  });

  const askQuestionMutation = useMutation({
    mutationFn: async ({ question, category }) => {
      // Get AI response
      const aiResponse = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a college admissions advisor. A student asked: "${question}"

Provide a helpful, encouraging response in 2-3 paragraphs. Be practical and supportive.`,
        add_context_from_internet: false
      });

      // Create question record
      return base44.entities.StudentQuestion.create({
        question,
        category,
        ai_response: aiResponse,
        is_answered: true
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-questions'] });
      setNewQuestion("");
      setShowAskForm(false);
      toast.success("Your question has been posted!");
    }
  });

  const upvoteMutation = useMutation({
    mutationFn: async (questionId) => {
      const question = questions.find(q => q.id === questionId);
      return base44.entities.StudentQuestion.update(questionId, {
        upvotes: (question.upvotes || 0) + 1
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-questions'] });
    }
  });

  const handleSubmit = () => {
    if (newQuestion.trim()) {
      askQuestionMutation.mutate({
        question: newQuestion,
        category: selectedCategory
      });
    }
  };

  const categories = [
    "College Apps",
    "Essay Writing",
    "Time Management",
    "Test Prep",
    "Activities",
    "Mental Health",
    "Scholarships",
    "Athletics",
    "Academic Success",
    "Career Planning",
    "Other"
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-purple-600" />
          <h2 className="text-3xl font-bold text-gray-900">Community Q&A</h2>
        </div>
        <Button
          onClick={() => setShowAskForm(!showAskForm)}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          Ask a Question
        </Button>
      </div>

      <AnimatePresence>
        {showAskForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6"
          >
            <Card className="border-2 border-purple-200">
              <CardHeader>
                <CardTitle className="text-lg">Ask the Community</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Your Question</label>
                  <Textarea
                    placeholder="What would you like to know?"
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                </div>

                <div className="flex gap-3 justify-end">
                  <Button variant="outline" onClick={() => setShowAskForm(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={!newQuestion.trim() || askQuestionMutation.isPending}
                    className="bg-gradient-to-r from-purple-600 to-pink-600"
                  >
                    {askQuestionMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Posting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Post Question
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto" />
          </div>
        ) : questions.length > 0 ? (
          questions.map((q, idx) => (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * idx }}
            >
              <Card className="hover:border-purple-200 transition-colors">
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => upvoteMutation.mutate(q.id)}
                        className="hover:text-purple-600"
                      >
                        <ThumbsUp className="w-5 h-5" />
                      </Button>
                      <span className="text-sm font-semibold">{q.upvotes || 0}</span>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start gap-2 mb-3">
                        <Badge variant="secondary">{q.category}</Badge>
                        {q.is_answered && (
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            ✓ Answered
                          </Badge>
                        )}
                      </div>

                      <h3 className="font-semibold text-lg mb-3 text-gray-900">
                        {q.question}
                      </h3>

                      {q.ai_response && (
                        <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-100">
                          <div className="text-xs font-medium text-purple-700 mb-2 flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" />
                            AI Response
                          </div>
                          <div className="prose prose-sm prose-purple max-w-none text-gray-700">
                            <ReactMarkdown>{q.ai_response}</ReactMarkdown>
                          </div>
                        </div>
                      )}

                      {q.coach_response && (
                        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                          <div className="text-xs font-medium text-blue-700 mb-2">
                            Coach Response
                          </div>
                          <p className="text-sm text-gray-700">{q.coach_response}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        ) : (
          <Card className="p-12 text-center">
            <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No questions yet</h3>
            <p className="text-gray-500">Be the first to ask a question!</p>
          </Card>
        )}
      </div>
    </motion.section>
  );
}