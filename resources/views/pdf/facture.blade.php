<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Facture {{ $facture->reference ?? $facture->id }}</title>

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

        .lignes th{
            background:#0B2A4A;
            color:#fff;
            padding:8px;
            border:1px solid #ddd;
        }

        .lignes td{
            border:1px solid #ddd;
            padding:8px;
        }

        .text-right{
            text-align:right;
        }

        .totaux{
            width:40%;
            margin-left:auto;
            margin-top:20px;
        }

        .totaux td{
            border:1px solid #ddd;
            padding:8px;
        }

        .grand-total{
            background:#0B2A4A;
            color:#fff;
            font-weight:bold;
            font-size:14px;
        }

        .notes{
            border:1px solid #ddd;
            padding:12px;
            min-height:70px;
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

    <h2>FACTURE</h2>

    <div class="reference">

        Référence :
        <strong>{{ $facture->reference ?? $facture->id }}</strong>

    </div>

</div>

<h3>Informations générales</h3>

<table class="info">

<tr>

<td class="label">Client</td>

<td>

@if($facture->client)

<strong>{{ $facture->client->nom_complet }}</strong><br>

{{ $facture->client->telephone }}<br>

{{ $facture->client->email }}

@endif

</td>

</tr>

<tr>

<td class="label">Dossier</td>

<td>

{{ $facture->dossier->reference_unique ?? '-' }}

</td>

</tr>

<tr>

<td class="label">Type de facture</td>

<td>

{{ ucfirst($facture->type) }}

</td>

</tr>

<tr>

<td class="label">Date d'émission</td>

<td>

{{ optional($facture->date_emission)->format('d/m/Y') }}

</td>

</tr>

<tr>

<td class="label">Date d'échéance</td>

<td>

{{ optional($facture->date_echeance)->format('d/m/Y') }}

</td>

</tr>

@if($facture->description)

<tr>

<td class="label">Description</td>

<td>

{{ $facture->description }}

</td>

</tr>

@endif

</table>

<h3>Détail des prestations</h3>

<table class="lignes">

<thead>

<tr>

<th>Description</th>

<th width="70">Qté</th>

<th width="130">Prix U.</th>

<th width="80">TVA</th>

<th width="150">Montant TTC</th>

</tr>

</thead>

<tbody>

@foreach($lignes as $ligne)

<tr>

<td>{{ $ligne->description }}</td>

<td class="text-right">{{ $ligne->quantite }}</td>

<td class="text-right">

{{ number_format($ligne->prix_unitaire,0,',',' ') }} FCFA

</td>

<td class="text-right">

{{ $ligne->tva }} %

</td>

<td class="text-right">

{{ number_format($ligne->montant_ttc,0,',',' ') }} FCFA

</td>

</tr>

@endforeach

</tbody>

</table>

<table class="totaux">

<tr>

<td><strong>Total TTC</strong></td>

<td class="text-right grand-total">

{{ number_format($facture->montant_ttc,0,',',' ') }} FCFA

</td>

</tr>

</table>

<div style="clear:both;"></div>

@if($facture->notes)

<h3>Notes</h3>

<div class="notes">

{{ $facture->notes }}

</div>

@endif

<table class="signature">

<tr>

<td>

<div class="line"></div><br>

Le Client

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