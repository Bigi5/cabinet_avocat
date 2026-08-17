<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>Décharge - {{ $transmission->reference ?? $decharge->id }}</title>
<style>
@page { margin: 25px; }
body { font-family: DejaVu Sans, sans-serif; color: #333; font-size: 13px; line-height: 1.5; }
.header { border-bottom: 3px solid #B08D57; padding-bottom: 15px; margin-bottom: 25px; }
.logo { width: 90px; float: left; }
.cabinet { margin-left: 110px; }
.cabinet h1 { margin: 0; color: #0B2A4A; font-size: 24px; }
.cabinet p { margin: 3px 0; color: #666; }
.clear { clear: both; }
.title { text-align: center; margin: 25px 0; }
.title h2 { margin: 0; color: #0B2A4A; font-size: 22px; }
.reference { color: #666; margin-top: 5px; font-size: 12px; }
h3 { background: #0B2A4A; color: #fff; padding: 8px 12px; margin-top: 20px; margin-bottom: 10px; font-size: 14px; }
table { width: 100%; border-collapse: collapse; }
.info td { border: 1px solid #ddd; padding: 8px; vertical-align: top; }
.label { width: 30%; background: #f4f4f4; font-weight: bold; }
.signature-box { margin-top: 40px; width: 100%; }
.signature-box td { width: 50%; text-align: center; vertical-align: top; }
.line { margin-top: 50px; border-top: 1px solid #000; width: 220px; display: inline-block; }
.footer { position: fixed; bottom: -10px; left: 0; right: 0; text-align: center; color: #777; font-size: 10px; }
</style>
</head>
<body>
<div class="header">
    <img src="{{ public_path('images/logo.png') }}" class="logo">
    <div class="cabinet">
        <h1>Cabinet d'Huissiers de Justice</h1>
        <p>Accusé de réception & Décharge</p>
        <p>Date d'émission : {{ now()->format('d/m/Y H:i') }}</p>
    </div>
    <div class="clear"></div>
</div>

<div class="title">
    <h2>ACCUSÉ DE RÉCEPTION ET DÉCHARGE</h2>
    <div class="reference">Référence Transmission : <strong>{{ $transmission->reference }}</strong></div>
</div>

<h3>Informations sur la Transmission</h3>
<table class="info">
<tr><td class="label">Référence Transmission</td><td>{{ $transmission->reference }}</td></tr>
<tr><td class="label">Type de document</td><td>{{ $transmission->type_label }}</td></tr>
<tr><td class="label">Objet</td><td>{{ $transmission->objet }}</td></tr>
<tr><td class="label">Date de transmission</td><td>{{ optional($transmission->date_transmission)->format('d/m/Y') }}</td></tr>
@if($transmission->dossier)
<tr><td class="label">Dossier concerné</td><td>{{ $transmission->dossier->reference_unique }}</td></tr>
@endif
</table>

<h3>Signataire de la Décharge</h3>
<table class="info">
<tr><td class="label">Nom & Prénom</td><td>{{ $decharge->signataire_nom }}</td></tr>
@if($decharge->signataire_fonction)
<tr><td class="label">Fonction / Qualité</td><td>{{ $decharge->signataire_fonction }}</td></tr>
@endif
<tr><td class="label">Date de réception</td><td>{{ optional($decharge->date_decharge)->format('d/m/Y') }}</td></tr>
<tr><td class="label">Statut décharge</td><td>{{ $decharge->statut_label }}</td></tr>
@if($decharge->observations)
<tr><td class="label">Observations</td><td>{{ $decharge->observations }}</td></tr>
@endif
</table>

<table class="signature-box">
<tr>
    <td>
        <p><strong>Le Remettant (Cabinet)</strong></p>
        <div class="line"></div>
        <p>{{ $transmission->emetteur->nom_complet ?? 'Cabinet' }}</p>
    </td>
    <td>
        <p><strong>Le Destinataire / Réceptionnaire</strong></p>
        <div class="line"></div>
        <p>{{ $decharge->signataire_nom }}</p>
    </td>
</tr>
</table>

<div class="footer">
    <strong>Cabinet d'Huissiers de Justice</strong> — Document officiel d'accusé de réception
</div>
</body>
</html>
