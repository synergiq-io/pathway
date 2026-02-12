import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Clock, ArrowRight, BookOpen, GraduationCap, Target, Trophy, Heart, DollarSign, Dumbbell, TrendingUp, Briefcase } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ReactMarkdown from "react-markdown";

const categoryIcons = {
  "College Apps": GraduationCap,
  "Essay Writing": BookOpen,
  "Time Management": Clock,
  "Test Prep": Target,
  "Activities": Trophy,
  "Mental Health": Heart,
  "Scholarships": DollarSign,
  "Athletics": Dumbbell,
  "Academic Success": TrendingUp,
  "Career Planning": Briefcase
};

const categoryColors = {
  "College Apps": "from-purple-500 to-pink-500",
  "Essay Writing": "from-blue-500 to-cyan-500",
  "Time Management": "from-orange-500 to-red-500",
  "Test Prep": "from-green-500 to-emerald-500",
  "Activities": "from-yellow-500 to-orange-500",
  "Mental Health": "from-pink-500 to-rose-500",
  "Scholarships": "from-emerald-500 to-teal-500",
  "Athletics": "from-indigo-500 to-purple-500",
  "Academic Success": "from-cyan-500 to-blue-500",
  "Career Planning": "from-violet-500 to-purple-500"
};

export default function AdviceArticleCard({ article, featured = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const Icon = categoryIcons[article.category] || BookOpen;
  const gradient = categoryColors[article.category] || "from-gray-500 to-gray-600";

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
      >
        <Card 
          className={`h-full cursor-pointer overflow-hidden border-2 hover:border-purple-300 transition-all group ${
            featured ? "bg-gradient-to-br from-white to-purple-50" : ""
          }`}
          onClick={() => setIsOpen(true)}
        >
          <div className={`h-2 bg-gradient-to-r ${gradient}`}></div>
          
          <CardHeader className="pb-3">
            <div className="flex items-start gap-3 mb-2">
              <div className={`p-2 bg-gradient-to-r ${gradient} rounded-lg text-white`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <Badge variant="secondary" className="mb-2">
                  {article.category}
                </Badge>
                {featured && (
                  <Badge className="ml-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
                    ⭐ Featured
                  </Badge>
                )}
              </div>
            </div>
            
            <CardTitle className="text-xl group-hover:text-purple-600 transition-colors leading-tight">
              {article.icon && <span className="mr-2">{article.icon}</span>}
              {article.title}
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-gray-600 mb-4 line-clamp-3">
              {article.summary || article.content?.substring(0, 150) + "..."}
            </p>

            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center gap-4">
                {article.reading_time_minutes && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{article.reading_time_minutes} min</span>
                  </div>
                )}
                {article.author && (
                  <span className="text-xs">by {article.author}</span>
                )}
              </div>
              
              <Button 
                variant="ghost" 
                size="sm"
                className="group-hover:bg-purple-100 group-hover:text-purple-700"
              >
                Read <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            {article.tags && article.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {article.tags.slice(0, 3).map((tag, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className={`w-full h-2 bg-gradient-to-r ${gradient} -mt-6 -mx-6 mb-4`}></div>
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-3 bg-gradient-to-r ${gradient} rounded-xl text-white`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <Badge variant="secondary" className="mb-1">
                  {article.category}
                </Badge>
                <DialogTitle className="text-2xl mt-2">
                  {article.icon && <span className="mr-2">{article.icon}</span>}
                  {article.title}
                </DialogTitle>
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
              {article.author && <span>By {article.author}</span>}
              {article.reading_time_minutes && (
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{article.reading_time_minutes} min read</span>
                </div>
              )}
            </div>
          </DialogHeader>

          <div className="prose prose-purple max-w-none">
            <ReactMarkdown>{article.content}</ReactMarkdown>
          </div>

          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t">
              {article.tags.map((tag, idx) => (
                <Badge key={idx} variant="outline">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}