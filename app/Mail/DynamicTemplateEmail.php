<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

use Illuminate\Mail\Mailables\Attachment;

class DynamicTemplateEmail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public ?string $pdfBase64 = null;

    public function __construct(
        public string $subjectText,
        public string $renderedHtml,
        ?string $pdfBinary = null,
        public string $pdfFilename = 'Documento_Oficial.pdf'
    ) {
        if ($pdfBinary) {
            $this->pdfBase64 = base64_encode($pdfBinary);
        }
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->subjectText,
        );
    }

    public function content(): Content
    {
        return new Content(
            htmlString: $this->renderedHtml,
        );
    }

    public function attachments(): array
    {
        if ($this->pdfBase64) {
            $decodedPdf = base64_decode($this->pdfBase64);
            return [
                Attachment::fromData(fn () => $decodedPdf, $this->pdfFilename)
                    ->withMime('application/pdf'),
            ];
        }

        return [];
    }
}
