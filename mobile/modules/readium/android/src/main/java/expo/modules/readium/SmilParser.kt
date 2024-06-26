/*
 * Copyright 2022 Readium Foundation. All rights reserved.
 * Use of this source code is governed by the BSD-style license
 * available in the top-level LICENSE file of the project.
 */

package expo.modules.readium

import org.readium.r2.shared.MediaOverlayNode
import org.readium.r2.shared.MediaOverlays
import org.readium.r2.shared.parser.xml.ElementNode
import org.readium.r2.shared.util.Href

internal object Namespaces {
    const val OPC = "urn:oasis:names:tc:opendocument:xmlns:container"
    const val ENC = "http://www.w3.org/2001/04/xmlenc#"
    const val SIG = "http://www.w3.org/2000/09/xmldsig#"
    const val COMP = "http://www.idpf.org/2016/encryption#compression"
    const val OPF = "http://www.idpf.org/2007/opf"
    const val DC = "http://purl.org/dc/elements/1.1/"
    const val OPS = "http://www.idpf.org/2007/ops"
    const val XHTML = "http://www.w3.org/1999/xhtml"
    const val SMIL = "http://www.w3.org/ns/SMIL"
    const val NCX = "http://www.daisy.org/z3986/2005/ncx/"
}

internal object SmilParser {
    /* According to https://www.w3.org/publishing/epub3/epub-mediaoverlays.html#sec-overlays-content-conf
       a Media Overlay Document MAY refer to more than one EPUB Content Document
       This might be possible only using Canonical Fragment Identifiers
       since the unique body and each seq element MUST reference
       one EPUB Content Document by means of its attribute epub:textref
    */

    fun parse(document: ElementNode, filePath: String): STMediaOverlays? {
        val body = document.getFirst("body", Namespaces.SMIL) ?: return null
        return parseSeq(body, filePath)?.let { STMediaOverlays(it) }
    }

    private fun parseSeq(node: ElementNode, filePath: String): List<MediaOverlayNode>? {
        val children: MutableList<MediaOverlayNode> = mutableListOf()
        for (child in node.getAll()) {
            if (child.name == "par" && child.namespace == Namespaces.SMIL)
                parsePar(child, filePath)?.let { children.add(it) }
            else if (child.name == "seq" && child.namespace == Namespaces.SMIL)
                parseSeq(child, filePath)?.let { children.addAll(it) }
        }

        /* No wrapping media overlay can be created unless:
       - all child media overlays reference the same audio file
       - the seq element has an textref attribute (this is mandatory according to the EPUB spec)
       */
        val textref = node.getAttrNs("textref", Namespaces.OPS)
        val audioFiles = children.mapNotNull(MediaOverlayNode::audioFile)
        return if (textref != null && audioFiles.distinct().size == 1) { // hierarchy
            val normalizedTextref = Href(textref, baseHref = filePath).string
            listOf(mediaOverlayFromChildren(normalizedTextref, children))
        } else children
    }

    private fun parsePar(node: ElementNode, filePath: String): MediaOverlayNode? {
        val text = node.getFirst("text", Namespaces.SMIL)?.getAttr("src") ?: return null
        val audio = node.getFirst("audio", Namespaces.SMIL)?.let { audioNode ->
            val src = audioNode.getAttr("src")
            val begin = audioNode.getAttr("clipBegin")?.let { ClockValueParser.parse(it) } ?: ""
            val end = audioNode.getAttr("clipEnd")?.let { ClockValueParser.parse(it) } ?: ""
            "$src#t=$begin,$end"
        }
        return MediaOverlayNode(Href(text, baseHref = filePath).string, Href(audio ?: "", baseHref = filePath).string)
    }

    private fun mediaOverlayFromChildren(text: String, children: List<MediaOverlayNode>): MediaOverlayNode {
        require(children.isNotEmpty() && children.mapNotNull { it.audioFile }.distinct().size <= 1)
        val audioChildren = children.mapNotNull { if (it.audioFile != null) it else null }
        val file = audioChildren.first().audioFile
        val start = audioChildren.first().clip.start ?: ""
        val end = audioChildren.last().clip.end ?: ""
        val audio = "$file#t=$start,$end"
        return MediaOverlayNode(text, audio, children, listOf("section"))
    }
}