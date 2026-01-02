
import { createClient } from '@/utils/supabase/server'
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const supabase = await createClient()

    // 1. Fetch Data
    const { data: project } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single()

    const { data: questions } = await supabase
        .from('project_questions')
        .select('*')
        .eq('project_id', id)
        .order('created_at', { ascending: true })

    if (!project) {
        return new NextResponse('Project not found', { status: 404 })
    }

    // 2. Build Document
    const doc = new Document({
        sections: [
            {
                properties: {},
                children: [
                    new Paragraph({
                        text: `RFP Response: ${project.rfp_name}`,
                        heading: HeadingLevel.TITLE,
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 400 },
                    }),
                    new Paragraph({
                        text: `Generated on ${new Date().toLocaleDateString()}`,
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 800 },
                    }),
                    ...(questions || []).flatMap((q, index) => [
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: `Q${index + 1}: ${q.question_text}`,
                                    bold: true,
                                    size: 24, // 12pt
                                }),
                            ],
                            spacing: { before: 400, after: 200 },
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: q.draft_answer || '[No Answer Generated]',
                                    size: 24,
                                }),
                            ],
                            spacing: { after: 400 },
                        }),
                        new Paragraph({
                            text: '', // Spacer
                            spacing: { after: 200 },
                        })
                    ]),
                ],
            },
        ],
    })

    // 3. Generate Buffer
    const buffer = await Packer.toBuffer(doc)

    // 4. Return Response
    return new NextResponse(buffer as any, {
        headers: {
            'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'Content-Disposition': `attachment; filename="RFP_Response_${project.rfp_name.replace(/\s+/g, '_')}.docx"`,
        },
    })
}
