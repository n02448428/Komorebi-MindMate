import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Calendar,
  Star,
  Download,
  Share2,
  MoreVertical 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import InsightCard from '../components/InsightCard';

interface Insight {
  id: string;
  title: string;
  content: string;
  category: string;
  date: string;
  rating?: number;
  tags: string[];
  isFavorite: boolean;
}

const AllInsights: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [insights, setInsights] = useState<Insight[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'date' | 'rating' | 'alphabetical'>('date');
  const [loading, setLoading] = useState(true);

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockInsights: Insight[] = [
      {
        id: '1',
        title: 'Morning Reflection',
        content: 'Today I realized the importance of starting each day with intention and gratitude.',
        category: 'Mindfulness',
        date: '2024-01-15',
        rating: 5,
        tags: ['gratitude', 'morning', 'intention'],
        isFavorite: true
      },
      {
        id: '2',
        title: 'Breathing Exercise Benefits',
        content: 'The 4-7-8 breathing technique has significantly reduced my anxiety levels.',
        category: 'Breathing',
        date: '2024-01-14',
        rating: 4,
        tags: ['breathing', 'anxiety', 'technique'],
        isFavorite: false
      },
      {
        id: '3',
        title: 'Nature Connection',
        content: 'Spending time in nature helps me feel more grounded and connected to myself.',
        category: 'Nature',
        date: '2024-01-13',
        rating: 5,
        tags: ['nature', 'grounding', 'connection'],
        isFavorite: true
      }
    ];
    
    setTimeout(() => {
      setInsights(mockInsights);
      setLoading(false);
    }, 1000);
  }, []);

  const categories = ['all', 'Mindfulness', 'Breathing', 'Nature', 'Sleep', 'Gratitude'];

  const filteredInsights = insights
    .filter(insight => 
      selectedCategory === 'all' || insight.category === selectedCategory
    )
    .filter(insight =>
      insight.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      insight.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      insight.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'alphabetical':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  const toggleFavorite = (insightId: string) => {
    setInsights(prev => 
      prev.map(insight => 
        insight.id === insightId 
          ? { ...insight, isFavorite: !insight.isFavorite }
          : insight
      )
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">All Insights</h1>
                <p className="text-sm text-gray-600">
                  {filteredInsights.length} insights found
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'rating' | 'alphabetical')}
                className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm"
              >
                <option value="date">Sort by Date</option>
                <option value="rating">Sort by Rating</option>
                <option value="alphabetical">Sort Alphabetically</option>
              </select>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search insights..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex gap-2 overflow-x-auto">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === category
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {category === 'all' ? 'All' : category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-200 rounded-xl h-48"></div>
              </div>
            ))}
          </div>
        ) : filteredInsights.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No insights found</h3>
            <p className="text-gray-600">
              {searchTerm || selectedCategory !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'Start your mindfulness journey to generate insights'
              }
            </p>
          </div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <AnimatePresence>
              {filteredInsights.map((insight, index) => (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <InsightCard
                    insight={insight}
                    onToggleFavorite={() => toggleFavorite(insight.id)}
                    className="h-full"
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AllInsights;