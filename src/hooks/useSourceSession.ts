import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useAppToast } from "@/hooks/useToast";
import { useBlessingToast } from "@/components/ui/blessing-toast";
import { selectCommentaries } from "@/utils/commentarySelector";
import { WebhookSource } from "@/hooks/useWebhookSource";
import { Language } from "@/components/LanguageToggle";

interface SessionContent {
  saveToggle: string;
  learnedButton: string;
  calendarButton: string;
}

interface UseSourceSessionOptions {
  source: WebhookSource | null;
  topicSelected: string;
  timeSelected: number;
  language: Language;
  content: SessionContent;
}

export const useSourceSession = ({
  source,
  topicSelected,
  timeSelected,
  language,
  content
}: UseSourceSessionOptions) => {
  const { user } = useAuth();
  const { success } = useAppToast();
  const { showBlessing } = useBlessingToast();

  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isTogglingSave, setIsTogglingSave] = useState(false);

  useEffect(() => {
    if (source && user && !currentSessionId) {
      createSessionForSource(source);
    }
  }, [source, user, currentSessionId, createSessionForSource]);

  const createSessionForSource = useCallback((src: WebhookSource) => {
    if (!user) return;
    const sessionId = crypto.randomUUID();
    setCurrentSessionId(sessionId);
    const sessionData = {
      id: sessionId,
      user_id: user.id,
      topic_selected: topicSelected,
      time_selected: timeSelected,
      source_title: src.title,
      status: "recommended",
      created_at: new Date().toISOString()
    };
    localStorage.setItem(`webhook_session_${sessionId}`, JSON.stringify(sessionData));
  }, [user, topicSelected, timeSelected]);

  const sanitizeText = useCallback((raw?: string) => {
    if (!raw) return "";
    return raw
      .replace(/\[([^\]]+)\]\((?:https?:\/\/)[^)]+\)/g, "$1")
      .replace(/https?:\/\/[^\s)]+/g, "")
      .replace(/(?:^|\n)\s*\**\s*(?:Working Link|Source Link|Sefaria Link)[^:\n]*:?.*$/gim, "")
      .replace(/<[^>]+>/g, "")
      .replace(/\s{2,}/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }, []);

  const title = language === "he" ? source?.title_he : source?.title;
  const excerpt = sanitizeText(source?.excerpt);
  const reflectionPrompt = sanitizeText(source?.reflection_prompt);
  const rawCommentaries = source?.commentaries || [];
  const cleanedCommentaries = rawCommentaries
    .map(c => (c || '').replace(/[*_`~]/g, '').trim())
    .filter(c => c && c.length > 2);
  const displayedCommentaries = cleanedCommentaries.length > 0
    ? cleanedCommentaries
    : selectCommentaries({
        topicSelected,
        sourceTitle: source?.title || '',
        sourceRange: source?.source_range || '',
        excerpt: source?.excerpt || ''
      }).slice(0, 2);

  const handleToggleSave = useCallback(async () => {
    if (!user || !source || isTogglingSave) return;
    setIsTogglingSave(true);
    try {
      if (!isSaved) {
        const { error } = await supabase
          .from('saved_sources')
          .insert({
            user_id: user.id,
            source_title: source.title,
            source_title_he: source.title_he,
            source_excerpt: sanitizeText(source.excerpt),
            source_excerpt_he: sanitizeText(source.excerpt),
            sefaria_link: source.sefaria_link,
            topic_selected: topicSelected,
            time_selected: timeSelected,
            is_saved: true
          });
        if (error) throw error;
        setIsSaved(true);
        showBlessing(language === 'he' ? 'חזק וברוך!' : "Chazak u'Baruch!");
        success(content.saveToggle);
      } else {
        const { error } = await supabase
          .from('saved_sources')
          .delete()
          .eq('user_id', user.id)
          .eq('source_title', source.title)
          .eq('topic_selected', topicSelected);
        if (error) throw error;
        setIsSaved(false);
        success('Removed from saved');
      }
    } catch (error) {
      console.error('Error toggling save:', error);
    } finally {
      setIsTogglingSave(false);
    }
  }, [user, source, isTogglingSave, isSaved, showBlessing, success, language, content.saveToggle, sanitizeText, topicSelected, timeSelected]);

  const handleMarkLearned = useCallback(() => {
    if (!currentSessionId || !source) return;
    const sessionKey = `webhook_session_${currentSessionId}`;
    const sessionData = JSON.parse(localStorage.getItem(sessionKey) || '{}');
    sessionData.status = 'learned';
    sessionData.updated_at = new Date().toISOString();
    localStorage.setItem(sessionKey, JSON.stringify(sessionData));
    success(content.learnedButton);
  }, [currentSessionId, source, success, content.learnedButton]);

  const handleCalendar = useCallback(() => {
    if (!source) return;
    const titleText = language === 'he' ? source.title_he : source.title;
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + timeSelected * 60000);
    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(titleText)}&dates=${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z&details=${encodeURIComponent(`Study: ${titleText}`)}`;
    window.open(calendarUrl, '_blank');
    success(content.calendarButton);
  }, [source, language, timeSelected, success, content.calendarButton]);

  return {
    title,
    excerpt,
    reflectionPrompt,
    displayedCommentaries,
    currentSessionId,
    isSaved,
    isTogglingSave,
    handleToggleSave,
    handleMarkLearned,
    handleCalendar
  };
};

export default useSourceSession;
