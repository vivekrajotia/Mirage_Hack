'use client';

import * as React from 'react';
import {
  ArrowLeft,
  Send,
  Bot,
  User,
  FileText,
  Download,
  Loader2,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface GenerateReportsProps {
  onBack: () => void;
}

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface GeneratedReport {
  id: string;
  title: string;
  content: string;
  timestamp: Date;
  status: 'generating' | 'completed' | 'error';
}

export const GenerateReports: React.FC<GenerateReportsProps> = ({ onBack }) => {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [inputMessage, setInputMessage] = React.useState('');
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [generatedReports, setGeneratedReports] = React.useState<GeneratedReport[]>([]);
  const [currentView, setCurrentView] = React.useState<'chat' | 'report'>('chat');
  const [currentReport, setCurrentReport] = React.useState<GeneratedReport | null>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  React.useEffect(() => {
    // Add welcome message
    const welcomeMessage: Message = {
      id: 'welcome',
      type: 'ai',
      content: `Welcome to AI Report Generation! 🤖

I can help you create intelligent reports from your trading data. Here are some examples of what you can ask:

• "Generate a monthly P&L summary report"
• "Create a risk analysis report for the last quarter"
• "Show me a performance analysis by commodity"
• "Generate a cost structure breakdown report"
• "Create a trading pattern analysis report"

Simply describe what kind of report you need, and I'll generate it for you!`,
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  }, []);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isGenerating) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsGenerating(true);

    // Simulate AI processing
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: `I understand you want to generate: "${inputMessage}"

I'm now creating a comprehensive report based on your trading data. This will include:
• Data analysis and key metrics
• Visual charts and graphs
• Insights and recommendations
• Executive summary

The report is being generated and will be available shortly. You can view it once it's completed.`,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiResponse]);
      
      // Create a new report
      const newReport: GeneratedReport = {
        id: Date.now().toString(),
        title: inputMessage,
        content: generateSampleReport(inputMessage),
        timestamp: new Date(),
        status: 'generating',
      };

      setGeneratedReports(prev => [...prev, newReport]);
      setIsGenerating(false);

      // Simulate report completion
      setTimeout(() => {
        setGeneratedReports(prev => 
          prev.map(report => 
            report.id === newReport.id 
              ? { ...report, status: 'completed' as const }
              : report
          )
        );

        const completionMessage: Message = {
          id: (Date.now() + 2).toString(),
          type: 'ai',
          content: `✅ Your report "${inputMessage}" has been generated successfully! 

You can now view the complete report by clicking on it in the reports list. The report includes detailed analysis, charts, and actionable insights based on your trading data.

Would you like me to generate another report or modify this one?`,
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, completionMessage]);
      }, 3000);
    }, 1000);
  };

  const generateSampleReport = (title: string): string => {
    return `
# ${title}

## Executive Summary

This report provides a comprehensive analysis of your trading portfolio based on the requested criteria. Our AI has analyzed your trading data and identified key patterns, risks, and opportunities.

## Key Findings

### Performance Metrics
- Total Portfolio Value: $2,450,000
- Total P&L: +$145,000 (+6.3%)
- Win Rate: 68.5%
- Average Trade Size: $85,000
- Risk-Adjusted Return: 1.85

### Top Performing Assets
1. **Commodity A** - +15.2% return
2. **Commodity B** - +12.8% return  
3. **Commodity C** - +9.4% return

### Risk Analysis
- Portfolio VaR (95%): $89,000
- Maximum Drawdown: -8.2%
- Sharpe Ratio: 1.67
- Beta: 1.23

## Detailed Analysis

### Trading Patterns
Our analysis reveals several key trading patterns:

- **Seasonal Trends**: Strong performance during Q2 and Q4
- **Commodity Concentration**: 45% exposure to energy commodities
- **Geographic Distribution**: 60% North American, 25% European, 15% Asian markets

### Cost Structure
Total trading costs represent 0.85% of portfolio value:
- Transaction Fees: $12,500
- Finance Costs: $8,300
- Insurance & Other: $4,200

## Recommendations

### Strategic Actions
1. **Diversification**: Consider reducing energy commodity exposure
2. **Cost Optimization**: Negotiate better transaction fee rates
3. **Risk Management**: Implement position sizing limits
4. **Performance Enhancement**: Focus on high-performing regions

### Tactical Adjustments
- Increase position sizes in top-performing commodities
- Implement stop-loss orders at -5% levels
- Consider hedging strategies for high-risk positions

## Conclusion

The portfolio shows strong fundamentals with room for optimization. Implementation of the recommended strategies could potentially increase returns by 8-12% while reducing overall risk exposure.

---

*This report was generated on ${new Date().toLocaleDateString()} using AI analysis of your trading data.*
`;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const viewReport = (report: GeneratedReport) => {
    setCurrentReport(report);
    setCurrentView('report');
  };

  const downloadReport = (report: GeneratedReport) => {
    const blob = new Blob([report.content], { type: 'text/markdown' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${report.title.replace(/\s+/g, '-')}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  if (currentView === 'report' && currentReport) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Report Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                onClick={() => setCurrentView('chat')}
                className="flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Chat
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                  Generated Report
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                  {currentReport.title}
                </p>
              </div>
            </div>
            <Button 
              onClick={() => downloadReport(currentReport)}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
            >
              <Download className="mr-2 h-4 w-4" />
              Download Report
            </Button>
          </div>

          {/* Report Content */}
          <Card>
            <CardContent className="p-8">
              <div className="prose prose-slate max-w-none dark:prose-invert">
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                  {currentReport.content}
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={onBack}
              className="flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Reports
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                Generate Reports with AI
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Describe what kind of report you need, and our AI will generate it for you
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Chat Interface */}
          <div className="lg:col-span-2">
            <Card className="h-[700px] flex flex-col">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  AI Report Assistant
                  <Sparkles className="h-4 w-4 ml-auto" />
                </CardTitle>
              </CardHeader>
              
              <CardContent className="flex-1 p-0">
                <ScrollArea className="h-[500px] p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${
                          message.type === 'user' ? 'flex-row-reverse' : ''
                        }`}
                      >
                        <div
                          className={`p-2 rounded-full ${
                            message.type === 'user'
                              ? 'bg-blue-500 text-white'
                              : 'bg-purple-500 text-white'
                          }`}
                        >
                          {message.type === 'user' ? (
                            <User className="h-4 w-4" />
                          ) : (
                            <Bot className="h-4 w-4" />
                          )}
                        </div>
                        <div
                          className={`max-w-[80%] p-3 rounded-lg ${
                            message.type === 'user'
                              ? 'bg-blue-500 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100'
                          }`}
                        >
                          <div className="text-sm whitespace-pre-wrap">
                            {message.content}
                          </div>
                          <div
                            className={`text-xs mt-1 opacity-70 ${
                              message.type === 'user' ? 'text-white' : 'text-slate-500'
                            }`}
                          >
                            {message.timestamp.toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    ))}
                    {isGenerating && (
                      <div className="flex gap-3">
                        <div className="p-2 rounded-full bg-purple-500 text-white">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                        <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-lg">
                          <div className="text-sm text-slate-900 dark:text-slate-100">
                            AI is generating your report...
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div ref={messagesEndRef} />
                </ScrollArea>
                
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Input
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Describe the report you want to generate..."
                      disabled={isGenerating}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!inputMessage.trim() || isGenerating}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    >
                      {isGenerating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Generated Reports Sidebar */}
          <div className="lg:col-span-1">
            <Card className="h-[700px]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Generated Reports
                </CardTitle>
              </CardHeader>
              
              <CardContent className="p-0">
                <ScrollArea className="h-[600px] p-4">
                  {generatedReports.length === 0 ? (
                    <div className="text-center text-slate-500 dark:text-slate-400 py-8">
                      <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No reports generated yet</p>
                      <p className="text-xs">Start a conversation to generate your first report!</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {generatedReports.map((report) => (
                        <Card
                          key={report.id}
                          className="cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => report.status === 'completed' && viewReport(report)}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm truncate">
                                  {report.title}
                                </h4>
                                <p className="text-xs text-slate-500 mt-1">
                                  {report.timestamp.toLocaleString()}
                                </p>
                              </div>
                              <div className="flex flex-col items-end gap-1">
                                <Badge
                                  variant={
                                    report.status === 'completed'
                                      ? 'default'
                                      : report.status === 'generating'
                                      ? 'secondary'
                                      : 'destructive'
                                  }
                                  className="text-xs"
                                >
                                  {report.status === 'generating' && (
                                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                  )}
                                  {report.status === 'completed' && '✓'}
                                  {report.status === 'error' && '✗'}
                                  {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                                </Badge>
                                {report.status === 'completed' && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      downloadReport(report);
                                    }}
                                    className="h-6 w-6 p-0"
                                  >
                                    <Download className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}; 