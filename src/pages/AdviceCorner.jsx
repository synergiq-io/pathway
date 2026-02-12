import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  Lightbulb, 
  Target, 
  Zap,
  BookOpen,
  Trophy,
  Heart,
  DollarSign,
  Dumbbell,
  GraduationCap,
  Briefcase,
  Search,
  TrendingUp,
  MessageCircle,
  Send,
  ThumbsUp,
  Clock,
  ArrowRight
} from "lucide-react";
import AdviceArticleCard from "../components/advice/AdviceArticleCard";
import AskAISection from "../components/advice/AskAISection";
import CommunityQuestions from "../components/advice/CommunityQuestions";

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

export default function AdviceCorner() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: articles = [], isLoading: articlesLoading } = useQuery({
    queryKey: ['advice-articles'],
    queryFn: () => base44.entities.AdviceArticle.filter({ is_published: true }, '-created_date', 100),
  });

  const { data: featuredArticles = [] } = useQuery({
    queryKey: ['featured-articles'],
    queryFn: () => base44.entities.AdviceArticle.filter({ is_featured: true, is_published: true }, '-created_date', 3),
  });

  const filteredArticles = articles.filter(article => {
    const matchesCategory = selectedCategory === "all" || article.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

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
    "Career Planning"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-red-500 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)'
        }}></div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white/20 backdrop-blur-lg rounded-3xl">
                <Sparkles className="w-12 h-12" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight">
              Advice Corner
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto font-light">
              Get expert guidance, AI-powered insights, and community support on your path to college
            </p>
          </motion.div>
        </div>

        {/* Decorative wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" className="w-full h-12 md:h-20 fill-slate-50">
            <path d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,58.7C960,64,1056,64,1152,58.7C1248,53,1344,43,1392,37.3L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"></path>
          </svg>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
        
        {/* AI Ask Section */}
        <AskAISection />

        {/* Featured Articles */}
        {featuredArticles.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <Zap className="w-6 h-6 text-purple-600" />
              <h2 className="text-3xl font-bold text-gray-900">Featured Advice</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredArticles.map((article, idx) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * idx }}
                >
                  <AdviceArticleCard article={article} featured />
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Category Pills */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <Lightbulb className="w-6 h-6 text-purple-600" />
            <h2 className="text-3xl font-bold text-gray-900">Browse by Topic</h2>
          </div>
          
          <div className="flex flex-wrap gap-3 mb-8">
            <Button
              onClick={() => setSelectedCategory("all")}
              variant={selectedCategory === "all" ? "default" : "outline"}
              className={selectedCategory === "all" ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0" : ""}
            >
              All Topics
            </Button>
            {categories.map((cat) => {
              const Icon = categoryIcons[cat];
              return (
                <Button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  variant={selectedCategory === cat ? "default" : "outline"}
                  className={selectedCategory === cat ? `bg-gradient-to-r ${categoryColors[cat]} text-white border-0` : ""}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {cat}
                </Button>
              );
            })}
          </div>

          {/* Search */}
          <div className="relative max-w-2xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search for advice, tips, guides..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-lg border-2 focus:border-purple-500"
            />
          </div>
        </motion.section>

        {/* Articles Grid */}
        <section>
          {articlesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredArticles.length > 0 ? (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              layout
            >
              <AnimatePresence>
                {filteredArticles.map((article) => (
                  <AdviceArticleCard key={article.id} article={article} />
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <Card className="p-12 text-center">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No articles found</h3>
              <p className="text-gray-500">Try adjusting your search or category filter</p>
            </Card>
          )}
        </section>

        {/* Community Q&A */}
        <CommunityQuestions />
      </div>
    </div>
  );
}