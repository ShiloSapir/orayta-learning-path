import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

import { 
  Share2, 
  Copy, 
  Mail, 
  MessageCircle,
  Download,
  ExternalLink,
  Heart,
  Quote
} from 'lucide-react';
import { useAppToast } from '@/hooks/useToast';
import { Language } from './LanguageToggle';
import { normalizeSefariaUrl, isValidSefariaUrl } from '@/utils/sefariaLinkValidator';

interface SocialSharingProps {
  language: Language;
  source: {
    title: string;
    text: string;
    reflection?: string;
    tags?: string[];
    sefariaLink: string;
  };
}

const content = {
  en: {
    shareTitle: 'Share This Learning',
    copyLink: 'Copy Link',
    shareEmail: 'Share via Email',
    shareMessage: 'Share Message',
    download: 'Download as Text',
    addToFavorites: 'Add to Favorites',
    openInSefaria: 'Open in Sefaria',
    customMessage: 'Add a personal message...',
    emailSubject: 'Torah Learning: {title}',
    emailBody: 'I wanted to share this meaningful Torah source with you:\n\n{text}\n\nMy reflection: {reflection}\n\nStudy more at: {link}',
    messageTemplate: 'Check out this beautiful Torah teaching: "{title}" - {text}',
    linkCopied: 'Link copied to clipboard!',
    textDownloaded: 'Learning content downloaded',
    addedToFavorites: 'Added to favorites',
    shareOptions: 'Share Options',
    quickActions: 'Quick Actions'
  },
  he: {
    shareTitle: 'שתף לימוד זה',
    copyLink: 'העתק קישור',
    shareEmail: 'שתף באימייל',
    shareMessage: 'שתף הודעה',
    download: 'הורד כטקסט',
    addToFavorites: 'הוסף למועדפים',
    openInSefaria: 'פתח בספריא',
    customMessage: 'הוסף הודעה אישית...',
    emailSubject: 'לימוד תורה: {title}',
    emailBody: 'רציתי לשתף איתך מקור תורה משמעותי:\n\n{text}\n\nההרהור שלי: {reflection}\n\nלמד עוד ב: {link}',
    messageTemplate: 'בדוק את השיעור הנפלא הזה: "{title}" - {text}',
    linkCopied: 'הקישור הועתק!',
    textDownloaded: 'תוכן הלימוד הורד',
    addedToFavorites: 'נוסף למועדפים',
    shareOptions: 'אפשרויות שיתוף',
    quickActions: 'פעולות מהירות'
  }
};

export function SocialSharing({ language, source }: SocialSharingProps) {
  const [customMessage, setCustomMessage] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const toast = useAppToast();
  const t = content[language];
  const isHebrew = language === 'he';

  const createShareText = useCallback(() => {
    const baseText = customMessage || 
      t.messageTemplate
        .replace('{title}', source.title)
        .replace('{text}', source.text);
    
    if (source.reflection) {
      return `${baseText}\n\nReflection: ${source.reflection}`;
    }
    return baseText;
  }, [customMessage, source, t]);

  const handleCopyLink = async () => {
    console.log('🔗 Copy link clicked');
    try {
      const hasValidSefaria = isValidSefariaUrl(source.sefariaLink);
      const linkToCopy = hasValidSefaria
        ? normalizeSefariaUrl(source.sefariaLink)
        : (typeof window !== 'undefined' ? window.location.href : source.sefariaLink);
      console.log('🔗 Link to copy:', linkToCopy);
      await navigator.clipboard.writeText(linkToCopy);
      toast.success(t.linkCopied);
    } catch (err) {
      console.error('🔗 Copy failed:', err);
      toast.error(isHebrew ? 'ההעתקה נכשלה' : 'Failed to copy to clipboard');
    }
  };

  const getEmailUrl = () => {
    const subject = t.emailSubject.replace('{title}', source.title);
    const validLink = isValidSefariaUrl(source.sefariaLink) 
      ? normalizeSefariaUrl(source.sefariaLink) 
      : (typeof window !== 'undefined' ? window.location.href : source.sefariaLink);
    const body = t.emailBody
      .replace('{text}', source.text)
      .replace('{reflection}', source.reflection || '')
      .replace('{link}', validLink);
    
    const mailto = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    console.log('📧 Email URL generated:', mailto);
    return mailto;
  };

  const getWhatsAppUrl = () => {
    const validLink = isValidSefariaUrl(source.sefariaLink) 
      ? normalizeSefariaUrl(source.sefariaLink) 
      : (typeof window !== 'undefined' ? window.location.href : source.sefariaLink);
    const text = createShareText() + '\n\n' + validLink;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    console.log('📱 WhatsApp URL generated:', whatsappUrl);
    return whatsappUrl;
  };

  const handleDownload = () => {
    const content = `
${source.title}
${'='.repeat(source.title.length)}

${source.text}

${source.reflection ? `Reflection:\n${source.reflection}\n` : ''}
${source.tags && source.tags.length > 0 ? `Tags: ${source.tags.join(', ')}\n` : ''}
Source: ${source.sefariaLink}

Downloaded from Orayata Learning App
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${source.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success(t.textDownloaded);
  };

  const handleAddToFavorites = () => {
    // This would integrate with the app's favorites system
    toast.success(t.addedToFavorites);
  };

  return (
    <Card className={`p-4 ${isHebrew ? 'text-right' : 'text-left'}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Share2 className="h-4 w-4 text-primary" />
          {t.shareTitle}
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? 'Less' : 'More'}
        </Button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopyLink}
          className="flex items-center gap-2"
        >
          <Copy className="h-4 w-4" />
          {t.copyLink}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            console.log('📧 Email button clicked');
            const emailUrl = getEmailUrl();
            console.log('📧 Opening email with URL:', emailUrl);
            window.location.href = emailUrl;
          }}
          className="flex items-center gap-2"
        >
          <Mail className="h-4 w-4" />
          {t.shareEmail}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            console.log('📱 WhatsApp button clicked');
            const whatsappUrl = getWhatsAppUrl();
            console.log('📱 Opening WhatsApp with URL:', whatsappUrl);
            window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
          }}
          className="flex items-center gap-2"
        >
          <MessageCircle className="h-4 w-4" />
          WhatsApp
        </Button>

        {isValidSefariaUrl(source.sefariaLink) && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              console.log('📚 Sefaria button clicked');
              const sefariaUrl = normalizeSefariaUrl(source.sefariaLink);
              console.log('📚 Opening Sefaria with URL:', sefariaUrl);
              window.open(sefariaUrl, '_blank', 'noopener,noreferrer');
            }}
            className="flex items-center gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            Sefaria
          </Button>
        )}
      </div>

      {isExpanded && (
        <>
          <Separator className="my-4" />
          
          {/* Custom Message */}
          <div className="space-y-3">
            <label className="text-sm font-medium">{t.customMessage}</label>
            <Textarea
              placeholder={t.customMessage}
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          <Separator className="my-4" />

          {/* Additional Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              {t.download}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleAddToFavorites}
              className="flex items-center gap-2"
            >
              <Heart className="h-4 w-4" />
              {t.addToFavorites}
            </Button>

          </div>

          {/* Preview */}
          {customMessage && (
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <div className="flex items-start gap-2 mb-2">
                <Quote className="h-4 w-4 text-muted-foreground mt-0.5" />
                <span className="text-sm font-medium">Preview:</span>
              </div>
              <p className="text-sm text-muted-foreground">{createShareText()}</p>
            </div>
          )}
        </>
      )}
    </Card>
  );
}