<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>Transmission {{ $transmission->reference ?? $transmission->id }}</title>

<style>

@page{
    margin:25px;
}

body{
    font-family: DejaVu Sans,sans-serif;
    color:#333;
    font-size:13px;
    line-height:1.5;
}

.header{
    border-bottom:3px solid #B08D57;
    padding-bottom:15px;
    margin-bottom:25px;
}

.logo{
    width:90px;
    float:left;
}

.cabinet{
    margin-left:110px;
}

.cabinet h1{
    margin:0;
    color:#0B2A4A;
    font-size:26px;
}

.cabinet p{
    margin:3px 0;
    color:#666;
}

.clear{
    clear:both;
}

.title{
    text-align:center;
    margin:30px 0;
}

.title h2{
    margin:0;
    color:#0B2A4A;
    font-size:24px;
}

.reference{
    color:#666;
    margin-top:5px;
    font-size:12px;
}

h3{
    background:#0B2A4A;
    color:#fff;
    padding:8px 12px;
    margin-top:25px;
    margin-bottom:10px;
}

table{
    width:100%;
    border-collapse:collapse;
}

.info td{
    border:1px solid #ddd;
    padding:8px;
    vertical-align:top;
}

.label{
    width:30%;
    background:#f4f4f4;
    font-weight:bold;
}

.message{
    border:1px solid #ddd;
    padding:12px;
    min-height:80px;
}

.signature{
    margin-top:60px;
    width:100%;
}

.signature td{
    width:50%;
    text-align:center;
}

.line{
    margin-top:60px;
    border-top:1px solid #000;
    width:220px;
    display:inline-block;
}

.footer{
    position:fixed;
    bottom:-10px;
    left:0;
    right:0;
    text-align:center;
    color:#777;
    font-size:10px;
}

.badge{
    display:inline-block;
    padding:4px 10px;
    border:1px solid #0B2A4A;
    border-radius:4px;
}

</style>

</head>

<body>

<div class="header">

    <img src="{{ public_path('images/logo.png') }}" class="logo">

    <div class="cabinet">

        <h1>Cabinet d'Huissiers de Justice</h1>

        <p>Rigueur • Efficacité • Confiance</p>

        <p>{{ now()->format('d/m/Y H:i') }}</p>

    </div>

    <div class="clear"></div>

</div>

<div class="title">

    <h2>TRANSMISSION DE DOCUMENT</h2>

    <div class="reference">

        Référence :
        <strong>{{ $transmission->reference }}</strong>

    </div>

</div>

<h3>Informations générales</h3>

<table class="info">

<tr>
<td class="label">Référence</td>
<td>{{ $transmission->reference }}</td>
</tr>

<tr>
<td class="label">Type</td>
<td>{{ $transmission->type_label }}</td>
</tr>

<tr>
<td class="label">Statut</td>
<td>
<span class="badge">
{{ $transmission->statut_label }}
</span>
</td>
</tr>

<tr>
<td class="label">Date de transmission</td>
<td>{{ optional($transmission->date_transmission)->format('d/m/Y') }}</td>
</tr>

@if($transmission->date_reception)
<tr>
<td class="label">Date de réception</td>
<td>{{ optional($transmission->date_reception)->format('d/m/Y') }}</td>
</tr>
@endif

</table>


<h3>Émetteur</h3>

<table class="info">

<tr>
<td class="label">Nom</td>
<td>{{ $transmission->emetteur->nom_complet ?? '-' }}</td>
</tr>

</table>


<h3>Destinataire</h3>

<table class="info">

<tr>
<td class="label">Nom</td>
<td>{{ $transmission->destinataire_nom }}</td>
</tr>

@if($transmission->destinataire_email)
<tr>
<td class="label">Email</td>
<td>{{ $transmission->destinataire_email }}</td>
</tr>
@endif

@if($transmission->destinataire_telephone)
<tr>
<td class="label">Téléphone</td>
<td>{{ $transmission->destinataire_telephone }}</td>
</tr>
@endif

@if($transmission->destinataire_fonction)
<tr>
<td class="label">Fonction</td>
<td>{{ $transmission->destinataire_fonction }}</td>
</tr>
@endif

@if($transmission->destinataire_organisation)
<tr>
<td class="label">Organisation</td>
<td>{{ $transmission->destinataire_organisation }}</td>
</tr>
@endif

@if($transmission->destinataire_adresse)
<tr>
<td class="label">Adresse</td>
<td>{{ $transmission->destinataire_adresse }}</td>
</tr>
@endif

</table>


<h3>Dossier concerné</h3>

<table class="info">

<tr>
<td class="label">Dossier</td>
<td>{{ $transmission->dossier->reference_unique ?? '-' }}</td>
</tr>

<tr>
<td class="label">Document</td>
<td>{{ $transmission->document->nom_fichier ?? '-' }}</td>
</tr>

</table>


<h3>Objet</h3>

<div class="message">

<strong>{{ $transmission->objet }}</strong>

</div>


@if($transmission->message)

<h3>Message</h3>

<div class="message">

{!! nl2br(e($transmission->message)) !!}

</div>

@endif


<h3>Preuve de transmission</h3>

<table class="info">

<tr>

<td class="label">Pièce jointe</td>

<td>

@if($transmission->preuve_chemin)

Oui

@else

Aucune preuve jointe

@endif

</td>

</tr>

</table>


@if($transmission->notes)

<h3>Notes</h3>

<div class="message">

{!! nl2br(e($transmission->notes)) !!}

</div>

@endif


<table class="signature">

<tr>

<td>

<div class="line"></div><br>

Le Destinataire

</td>

<td>

<div class="line"></div><br>

Le Cabinet

</td>

</tr>

</table>


<div class="footer">

<strong>Cabinet d'Huissiers de Justice</strong><br>

Adresse • Téléphone • Email

</div>

</body>
</html>