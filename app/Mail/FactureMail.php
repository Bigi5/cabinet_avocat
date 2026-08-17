<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Contracts\Queue\ShouldQueue;

class FactureMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public $facture;
    public $pdfData;

    public function __construct($facture, $pdfData)
    {
        $this->facture = $facture;
        $this->pdfData = $pdfData;
    }

    public function build()
    {
        $filename = 'facture-' . ($this->facture->reference ?? $this->facture->id) . '.pdf';

        return $this->subject('Votre facture ' . ($this->facture->reference ?? ''))
            ->view('emails.facture')
            ->with(['facture' => $this->facture])
            ->attachData($this->pdfData, $filename, [
                'mime' => 'application/pdf',
            ]);
    }
}
