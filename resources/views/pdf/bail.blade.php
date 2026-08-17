<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Contrat de bail</title>

    <style>
        @page {
            margin: 25px;
        }

        body{
            font-family: DejaVu Sans, sans-serif;
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
            color:#0B2A4A;
            font-size:24px;
            margin-bottom:5px;
        }

        .reference{
            color:#666;
            font-size:12px;
        }

        h3{
            background:#0B2A4A;
            color:white;
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
            width:35%;
            background:#f4f4f4;
            font-weight:bold;
        }

        .echeances th{
            background:#0B2A4A;
            color:white;
            padding:8px;
            border:1px solid #ddd;
        }

        .echeances td{
            border:1px solid #ddd;
            padding:8px;
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

    <img class="logo" src="{{ public_path('images/logo.png') }}">

    <div class="cabinet">
        <h1>Cabinet d'Huissiers de Justice</h1>

        <p>Rigueur • Efficacité • Confiance</p>

        <p>{{ now()->format('d/m/Y H:i') }}</p>
    </div>

    <div class="clear"></div>

</div>

<div class="title">

    <h2>CONTRAT DE BAIL</h2>

    <div class="reference">

        Référence :
        <strong>{{ $bail->reference_formatted }}</strong>

    </div>

</div>

<h3>Informations générales</h3>

<table class="info">

<tr>

<td class="label">Bailleur</td>

<td>

<strong>{{ $bail->bailleur?->nom }}</strong><br>

{{ $bail->bailleur?->telephone }}<br>

{{ $bail->bailleur?->email }}

</td>

</tr>

<tr>

<td class="label">Locataire</td>

<td>

<strong>{{ $bail->locataire?->nom }}</strong><br>

{{ $bail->locataire?->telephone }}<br>

{{ $bail->locataire?->email }}

</td>

</tr>

<tr>

<td class="label">Adresse du bien</td>

<td>{{ $bail->adresse_bien }}</td>

</tr>

<tr>

<td class="label">Référence cadastrale</td>

<td>{{ $bail->reference_cadastrale }}</td>

</tr>

<tr>

<td class="label">Montant du loyer</td>

<td>{{ $bail->montant_loyer_formatted }}</td>

</tr>

<tr>

<td class="label">Fréquence</td>

<td>{{ $bail->frequence_label }}</td>

</tr>

<tr>

<td class="label">Caution</td>

<td>{{ number_format($bail->caution,0,',',' ') }} FCFA</td>

</tr>

<tr>

<td class="label">Date de début</td>

<td>{{ $bail->date_debut->format('d/m/Y') }}</td>

</tr>

<tr>

<td class="label">Date de fin</td>

<td>

{{ $bail->date_fin?->format('d/m/Y') ?? 'Illimitée' }}

</td>

</tr>

</table>

<h3>Description</h3>

<p>

{{ $bail->description ?: 'Aucune description.' }}

</p>

<h3>Échéancier</h3>

<table class="echeances">

<thead>

<tr>

<th>Date</th>

<th>Montant</th>

<th>Statut</th>

</tr>

</thead>

<tbody>

@foreach($bail->echeances as $echeance)

<tr>

<td>{{ $echeance->date_echeance->format('d/m/Y') }}</td>

<td>{{ number_format($echeance->montant,0,',',' ') }} FCFA</td>

<td>{{ ucfirst(str_replace('_',' ',$echeance->statut)) }}</td>

</tr>

@endforeach

</tbody>

</table>

<table class="signature">

<tr>

<td>

<div class="line"></div>

<br>

Le Bailleur

</td>

<td>

<div class="line"></div>

<br>

Le Locataire

</td>

</tr>

</table>

<div class="footer">

Cabinet d'Huissiers de Justice

</div>

</body>
</html>