<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
    <xsl:output method="html" encoding="UTF-8"/>
    <xsl:template match="/">
        <xsl:for-each select="FIELDS/GROUP">
            <table id="heading" width="100%" border="0" cellspacing="0" cellpadding="0">
                
                <tbody>
                    <!-- 1st row -->
                    <xsl:for-each select="PANELHEADER">
                        <tr>
                            <td colspan="2" class="ribbonhead" style="color:#FFFFFF;" >
                                <h1 style="font-family:Arial, Helvetica, sans-serif;">
                                    <xsl:value-of select="VALUE" />
                                </h1>
                            </td>
                        </tr>
                    </xsl:for-each>
                    <!-- 2nd row -->
                    <tr>
                        <td width="70%" valign="top" align="left">
                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                <xsl:for-each select="PANELBODY">
                                    <xsl:for-each select="FIELD">
                                        <xsl:choose>
                                            <!-- Main Text Box -->
                                            <xsl:when test="@type='TextBox' and ((@id='name') or (@id='age') or (@id='uhid'))">
                                                <xsl:if test="PROPERTIES/PROPERTY[@name = 'value' and string(.)]">
                                                    <tr>
                                                        <xsl:apply-templates select = "@label" />                                                     
                                                        <td width="63%" align="left" valign="top">
                                                            <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                <xsl:if test="@name='value'">
                                                                    <xsl:value-of select="current()"></xsl:value-of>
                                                                    <xsl:value-of select="../../@Backtext"></xsl:value-of>
                                                                </xsl:if>
                                                            </xsl:for-each>
                                                        </td>
                                                    </tr>
                                                </xsl:if>
                                            </xsl:when>
                                            
                                            <!-- Main Text Area-->
                                            <xsl:when test="@type='TextArea' and (@id='address')">
                                                <xsl:if test="VALUE and VALUE!=''">
                                                    <tr>
                                                        <xsl:apply-templates select = "@label" />
                                                        <td width="63%" align="left" valign="top">
                                                            <xsl:call-template name="LFsToBRs">
                                                                <xsl:with-param name="input" select="VALUE"/>
                                                            </xsl:call-template> 
                                                        </td>
                                                    </tr>
                                                </xsl:if>
                                            </xsl:when>
                                            
                                            <!-- Main Radio Button -->                          
                                            <xsl:when test="@type='RadioButtonList' and ((@id='gender') or (@id='education') or (@id='occupation') or (@id='martial_status') or (@id='religion') or (@id='level_status')or (@id='place_of_living'))">
                                                <xsl:if test="boolean(LISTITEMS/LISTITEM/@Selected = 'true')">
                                                    <tr>
                                                        <xsl:apply-templates select = "@label" />
                                                        <td width="63%" align="left" valign="top">
                                                            <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                <xsl:if test="@Selected = 'true'">
                                                                    <xsl:value-of select="current()"></xsl:value-of>
                                                                </xsl:if>
                                                            </xsl:for-each>
                                                            <xsl:if test="FIELD">
                                                                <span>
                                                                    <xsl:attribute name="id">
                                                                        <xsl:value-of select="@Backdivid"></xsl:value-of>
                                                                    </xsl:attribute>
                                                                    <xsl:attribute name="class">
                                                                        <xsl:value-of select="@Backcontrols"></xsl:value-of>
                                                                    </xsl:attribute>
                                                                    <xsl:for-each select="FIELD">
                                                                        <xsl:choose>
                                                                            <xsl:when test="@type='TextBox'">
                                                                                <!--                                                                                <br/>--> 
                                                                                <!--                                                                                <xsl:value-of select="@label" />&#160;-->
                                                                                <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                                    <xsl:if test="@name='value'"> |
                                                                                        <span id="sub_textbox"> 
                                                                                            <xsl:value-of select="current()"></xsl:value-of>
                                                                                        </span>
                                                                                    </xsl:if>
                                                                                </xsl:for-each>
                                                                            </xsl:when>
                                                            
                                                                            <xsl:when test="@type='RadioButtonList'">
                                                                                <br/>
                                                                                <xsl:value-of select="@label" />&#160;
                                                                                <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                                    <xsl:if test="@Selected = 'true'">
                                                                                        <span id="sub_textbox">
                                                                                            <xsl:value-of select="current()"></xsl:value-of>
                                                                                        </span>
                                                                                    </xsl:if>
                                                                                </xsl:for-each>
                                                                            </xsl:when>
                                                            
                                                                            <xsl:when test="@type='DropDownList'">
                                                                                <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                                    <xsl:if test="@Selected = 'true'">
                                                                                        <br/>
                                                                                        <xsl:value-of select="../../@label"/>  
                                                                                        <xsl:value-of select="@value"></xsl:value-of>
                                                                                    </xsl:if>
                                                                                </xsl:for-each>
                                                                            </xsl:when>
                                                                        </xsl:choose>
                                                                    </xsl:for-each>
                                                                </span>
                                                            </xsl:if>
                                                        </td>
                                                    </tr>
                                                </xsl:if>
                                            </xsl:when>
                                        </xsl:choose>
                                    </xsl:for-each>
                                </xsl:for-each>
                            </table>
                        </td>
                        <td width="30%" align="right" valign="top">
                                <xsl:for-each select="PANELBODY/FIELD[((@type='TextBox') or (@type='CheckBoxList')) and ((@id='TherapistName') or (@id='referral_details'))]">
                                    <xsl:choose>
                                        <xsl:when test="@type='TextBox'">
                                            <table width="280" border="0" cellspacing="0" cellpadding="0" class="referl-details">
                                            <tr>
                                                <td width="100" align="left" valign="top">
                                                    <strong>
                                                        Recorded by <span class="colon"> : </span>
                                                    </strong> 
                                                </td>
                                                <td width="180" align="left" valign="top">
                                                        <span id="created_name"></span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td width="100" align="left" valign="top">
                                                    <strong>
                                                        Date <span class="colon"> : </span>
                                                    </strong>
                                                </td>
                                                <td width="180" align="left" valign="top">
                                                    <span id="created_date"></span>
                                                </td>
                                            </tr>
                                            
                                            </table>
                                            <table width="280" border="0" cellspacing="0" cellpadding="0" class="referl-details">
                                            <xsl:if test="PROPERTIES/PROPERTY[@name = 'value' and string(.)]">
                                                <tr>
                                                    <td width="100" align="left" valign="top">
                                                        <strong>
                                                            Consultant <span class="colon"> : </span>
                                                        </strong>
                                                    </td>
                                                    <td width="180" align="left" valign="top">
                                                        <xsl:for-each select="PROPERTIES/PROPERTY">
                                                            <xsl:if test="@name='value'">
                                                                <strong>
                                                                    <xsl:value-of select="current()"></xsl:value-of>
                                                                    <xsl:value-of select="../../@Backtext"></xsl:value-of>
                                                                </strong> 
                                                            </xsl:if>
                                                        </xsl:for-each>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <span id='hide_span'>Hiding text</span>
                                                    </td>
                                                </tr>
                                            </xsl:if>
                                            <tr>
                                                <td width="100" align="left" valign="top">
                                                    <strong>
                                                        Date <span class="colon"> : </span>
                                                    </strong>
                                                </td>                                                
                                                <td width="180" align="left" valign="top">
                                                    <span id="date_name"></span> | <span id="time"></span> 
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <span id='hide_span'>Hiding text</span>
                                                </td>
                                            </tr>
                                            </table>
                                        </xsl:when>
                                        <xsl:when test="@type='CheckBoxList'">
                                            <table width="280" border="0" cellspacing="0" cellpadding="0" class="referl-details">
                                            <tr>
                                                <xsl:if test="boolean(LISTITEMS/LISTITEM/@Selected = 'true')">
                                                    <td width="100" align="left" valign="top">
                                                        <strong>
                                                            <xsl:value-of select="@label" /> <span class="colon"> : </span>
                                                        </strong>
                                                    </td>
                                                    <td width="180" align="left" valign="top">
                                                        <xsl:for-each select="LISTITEMS/LISTITEM[@Selected = 'true']">
                                                            <xsl:value-of select="concat(' ' , @value)" />
                                                            <xsl:if test="not(position() = last())">,</xsl:if>
                                                        </xsl:for-each>
                                                        <xsl:if test="FIELD">
                                                            <span>
                                                                <xsl:attribute name="id">
                                                                    <xsl:value-of select="@Backdivid"></xsl:value-of>
                                                                </xsl:attribute>
                                                                <xsl:attribute name="class">
                                                                    <xsl:value-of select="@Backcontrols"></xsl:value-of>
                                                                </xsl:attribute>
                                                                <xsl:for-each select="FIELD">
                                                                    <xsl:choose>
                                                                        <xsl:when test="@type='TextBox'">
<!--                                                                            ,<xsl:value-of select="@label" />&#160;-->
                                                                            <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                                <xsl:if test="@name='value'">
                                                                                    <span id="sub_textbox">
                                                                                       | <xsl:value-of select="current()"></xsl:value-of>
                                                                                    </span>
                                                                                </xsl:if>
                                                                            </xsl:for-each>
                                                                        </xsl:when>
                                                                    </xsl:choose>
                                                                </xsl:for-each>
                                                            </span>
                                                        </xsl:if>
                                                    </td>
                                                </xsl:if>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <span id='hide_span'>Hiding text</span>
                                                </td>
                                            </tr>
                            </table>
                                        </xsl:when>
                                    </xsl:choose>
                                </xsl:for-each>
                        </td>
                    </tr>
                
                    <!-- 3rd row -->
                    <xsl:for-each select="PANELBODY/FIELD[@type='Header2' and @label='Informant']">
                        <tr>
                            <td colspan="2" align="left" valign="top" class="ribbon">
                                <h2 style="font-family:Arial, Helvetica, sans-serif;"> 
                                    <xsl:value-of select="@label" />
                                </h2>
                            </td>
                        </tr>
                    </xsl:for-each>
                
                    <!-- 4th row -->
                    <tr>
                        <td colspan="2">
                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                <tr>
                                    <xsl:for-each select="PANELBODY/FIELD[(@id='relationship') or (@id='primary_care_giver')]">
                                        <xsl:choose>
                                            <!-- Main Checkbox -->
                                            <xsl:when test="@type='CheckBoxList'">
                                                <xsl:if test="boolean(LISTITEMS/LISTITEM/@Selected = 'true')">
                                                    <td width="25%" align="left" valign="top" class="small-left-heading">
                                                        <xsl:value-of select="@label" /> 
                                                        <span class="colon"> : </span>
                                                    </td>
                                                    <td width="25%" align="left" valign="top">
                                                        <xsl:for-each select="LISTITEMS/LISTITEM[@Selected = 'true']">
                                                            <xsl:value-of select="concat(' ' , @value)" />
                                                            <xsl:if test="not(position() = last())">,</xsl:if>
                                                        </xsl:for-each>
                                                        <xsl:if test="FIELD">
                                                            <span>
                                                                <xsl:attribute name="id">
                                                                    <xsl:value-of select="@Backdivid"></xsl:value-of>
                                                                </xsl:attribute>
                                                                <xsl:attribute name="class">
                                                                    <xsl:value-of select="@Backcontrols"></xsl:value-of>
                                                                </xsl:attribute>
                                                                <xsl:for-each select="FIELD">
                                                                    <xsl:choose>
                                                                        <xsl:when test="@type='TextBox'">
                                                                            |
                                                                            <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                                <xsl:if test="@name='value'">
                                                                                    <span id="sub_textbox">
                                                                                        <xsl:value-of select="current()"></xsl:value-of>
                                                                                    </span>
                                                                                </xsl:if>
                                                                            </xsl:for-each>
                                                                        </xsl:when>
                                                                    </xsl:choose>
                                                                </xsl:for-each>
                                                            </span>
                                                        </xsl:if>
                                                    </td>
                                                </xsl:if>
                                            </xsl:when>
                                            
                                            <xsl:when test="@type='MultiDropDownList'">
                                                <td width="25%" align="left" valign="top" class="small-left-heading">
                                                    <xsl:value-of select="@label" /> 
                                                    <span class="colon"> : </span>
                                                </td>
                                                <td width="25%" align="left" valign="top">
                                                        <xsl:for-each select="LISTITEMS/LISTITEM[@Selected = 'true']">
                                                            <xsl:value-of select="concat(' ' , @value)" />
                                                            <xsl:if test="not(position() = last())">,</xsl:if>
                                                        </xsl:for-each>
                                                </td>
                                            </xsl:when>
                                        </xsl:choose>
                                    </xsl:for-each>

                                </tr>
                            
                                <tr>
                                    <xsl:for-each select="PANELBODY/FIELD[(@id='information') or (@id='information_adequacy')]">
                                        <xsl:choose>
                                            <xsl:when test="@type='RadioButtonList'">
                                                <xsl:if test="boolean(LISTITEMS/LISTITEM/@Selected = 'true')">
                                                    <td width="25%" align="left" valign="top" class="small-left-heading">
                                                    <xsl:value-of select="@label" /> 
                                                    <span class="colon"> : </span>
                                                </td>
                                                    <td width="25%" align="left" valign="top">
                                                        <xsl:for-each select="LISTITEMS/LISTITEM">
                                                            <xsl:if test="@Selected = 'true'">
                                                                <xsl:value-of select="current()"></xsl:value-of>
                                                            </xsl:if>
                                                        </xsl:for-each>
                                                        <xsl:if test="FIELD">
                                                            <span>
                                                                <xsl:attribute name="id">
                                                                    <xsl:value-of select="@Backdivid"></xsl:value-of>
                                                                </xsl:attribute>
                                                                <xsl:attribute name="class">
                                                                    <xsl:value-of select="@Backcontrols"></xsl:value-of>
                                                                </xsl:attribute>
                                                                <xsl:for-each select="FIELD">
                                                                    <xsl:choose>
                                                                        <xsl:when test="@type='RadioButtonList'">
                                                                            <br/>
                                                                            <xsl:value-of select="@label" />&#160;
                                                                            <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                                <xsl:if test="@Selected = 'true'">
                                                                                    <span id="sub_textbox">
                                                                                        <xsl:value-of select="current()"></xsl:value-of>
                                                                                    </span>
                                                                                </xsl:if>
                                                                            </xsl:for-each>
                                                                        </xsl:when>
                                                                    </xsl:choose>
                                                                </xsl:for-each>
                                                            </span>
                                                        </xsl:if>
                                                    </td>
                                                </xsl:if>
                                            </xsl:when>
                                        </xsl:choose>
                                    </xsl:for-each>
                                </tr>
                            
                                <tr>
                                    <xsl:for-each select="PANELBODY/FIELD[@id='duration_of_relationship']">
                                        <xsl:choose>
                                            <!--Main Text Box With DropDownList-->
                                            <xsl:when test="@type='TextBoxDDL'">
                                                <xsl:if test="PROPERTIES/PROPERTY[@name = 'value' and string(.)]">
                                                    <td width="27%" align="left" valign="top" class="small-left-heading">
                                                    <xsl:value-of select="@label" /> 
                                                    <span class="colon"> : </span>
                                                </td>
                                                    <td width="23%" align="left" valign="top">
                                                        <xsl:for-each select="PROPERTIES/PROPERTY">
                                                            <xsl:if test="@name='value'">
                                                                <xsl:value-of select="current()"></xsl:value-of>
                                                            </xsl:if>
                                                        </xsl:for-each>
                                                        <xsl:for-each select="FIELD/LISTITEMS/LISTITEM">
                                                            <xsl:if test="@Selected = 'true'">&#160;
                                                                <xsl:value-of select="@value"></xsl:value-of>
                                                            </xsl:if>
                                                        </xsl:for-each>
                                                    </td>
                                                    <td colspan="2" align="left" valign="top">
                                                        <span id='hide_span'>Hiding text</span>
                                                    </td>
                                                </xsl:if>
                                            </xsl:when>
                                        </xsl:choose>
                                    </xsl:for-each>
                                
                                </tr>
                                
                                <tr>
                                    <xsl:for-each select="PANELBODY/FIELD[@id='informant_notes']">
                                        <xsl:choose>
                                            <xsl:when test="@type='TextArea'">
                                                <xsl:if test="VALUE and VALUE!=''">
                                                    <tr>
                                                        <xsl:apply-templates select = "@label" />
                                                            <td colspan='4' width="70%" align="left" valign="middle">
                                                                <xsl:call-template name="LFsToBRs">
                                                                    <xsl:with-param name="input" select="VALUE"/>
                                                                </xsl:call-template>
                                                            </td>
                                                    </tr>
                                                </xsl:if>
                                            </xsl:when>
                                        </xsl:choose>
                                    </xsl:for-each>
                                </tr>
                            </table>
                        </td>
                    </tr>
                
                    <!-- 5th row -->
                
                    <tr>
                        <td align="left" valign="top">
                            <table width="100%" border="0" cellspacing="0" cellpadding="0" class="table-boder">
                                <tr>
                                    <td id="complaints" align="left" valign="top" width="35%" class="nopadding">
                                        <table width="100%" border="0" cellspacing="0" cellpadding="0" class="table2">
                                            <xsl:for-each select="PANELBODY/FIELD[@ADDButtonID='RGCompliantadd']">
                                                <xsl:choose>
                                                    <xsl:when test="@type='RadGrid'">
                                                        <xsl:for-each select="COLUMNS">
                                                            <xsl:for-each select="FIELD">
                                                                <tr>
                                                                    <td align="left" valign="top" class="small-left-heading list complaints">
                                                                        <xsl:choose>
<!--                                                                                                                                                         Text Box -->
                                                                            <xsl:when test="@type='TextBox'">
                                                                                <xsl:if test="PROPERTIES/PROPERTY[@name = 'value' and string(.)]">
                                                                                    <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                                        <xsl:if test="@name='value'">
                                                                                            <xsl:value-of select="current()"></xsl:value-of>
                                                                                        </xsl:if>
                                                                                    </xsl:for-each>
                                                                                </xsl:if>
                                                                            </xsl:when>
                                                                        </xsl:choose>
                                                                    </td>
                                                                </tr>
                                                            </xsl:for-each>
                                                        </xsl:for-each>
                                                    </xsl:when>
                                                </xsl:choose>
                                            </xsl:for-each>
                                        </table>
                                    </td>
<!--                                    <td align="left" valign="top">
                                        
                                    </td>-->
                                    <td align="left" valign="top" width="100%" class="nopadding">
                                        <table width="100%" border="0" cellspacing="0" cellpadding="0" class="table-boder topborder">
                                            <xsl:for-each select="PANELBODY/FIELD[(@id='total_duration') or (@id='total_duration_notes') or (@id='mode_of_onset') or (@id='course_type') or (@id='precipitating_factor') or (@id='nature')]">
                                                <xsl:choose>
                                                    <!-- Main Text Box With DropDownList-->
                                                    <xsl:when test="@type='TextBoxDDL'">
                                                        <xsl:if test="PROPERTIES/PROPERTY[@name = 'value' and string(.)]">
                                                            <tr>
                                                                <xsl:apply-templates select = "@label" />
                                                                <td width="70%" align="left" valign="middle">
                                                                    <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                        <xsl:if test="@name='value'">
                                                                            <xsl:value-of select="current()"></xsl:value-of>
                                                                        </xsl:if>
                                                                    </xsl:for-each>
                                                                    <xsl:for-each select="FIELD/LISTITEMS/LISTITEM">
                                                                        <xsl:if test="@Selected = 'true'">&#160;
                                                                            <xsl:value-of select="@value"></xsl:value-of>
                                                                        </xsl:if>
                                                                    </xsl:for-each>
                                                                </td>
                                                            </tr>
                                                        </xsl:if>
                                                    </xsl:when>
                                    
                                                    <!-- Main Text Area-->
                                                    <xsl:when test="@type='TextArea'">
                                                        <xsl:if test="VALUE and VALUE!=''">
                                                            <tr>
                                                                <xsl:apply-templates select = "@label" />
                                                                <td width="70%" align="left" valign="middle">
                                                                    <xsl:call-template name="LFsToBRs">
                                                                        <xsl:with-param name="input" select="VALUE"/>
                                                                    </xsl:call-template>
                                                                </td>
                                                            </tr>
                                                        </xsl:if>
                                                    </xsl:when>
                                    
                                                    <xsl:when test="@type='RadioButtonList'">
                                                        <xsl:if test="boolean(LISTITEMS/LISTITEM/@Selected = 'true')">
                                                            <tr>
                                                                <xsl:apply-templates select = "@label" />
                                                                <td width="70%" align="left" valign="top">
                                                                    <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                        <xsl:if test="@Selected = 'true'">
                                                                            <xsl:value-of select="current()"></xsl:value-of>
                                                                        </xsl:if>
                                                                    </xsl:for-each>
                                                                    <xsl:if test="FIELD">
                                                                        <span> | 
                                                                            <xsl:attribute name="id">
                                                                                <xsl:value-of select="@Backdivid"></xsl:value-of>
                                                                            </xsl:attribute>
                                                                            <xsl:attribute name="class">
                                                                                <xsl:value-of select="@Backcontrols"></xsl:value-of>
                                                                            </xsl:attribute>
                                                                            <xsl:for-each select="FIELD">
                                                                                <xsl:choose>
                                                                                    <xsl:when test="@type='RadioButtonList'"> 
                                                                                        <xsl:value-of select="@label" />&#160;
                                                                                        <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                                            <xsl:if test="@Selected = 'true'">
                                                                                                <span id="sub_textbox">
                                                                                                    <xsl:value-of select="current()"></xsl:value-of>
                                                                                                </span>
                                                                                            </xsl:if>
                                                                                        </xsl:for-each>
                                                                                    </xsl:when>
                                                                                </xsl:choose>
                                                                            </xsl:for-each>
                                                                        </span>
                                                                    </xsl:if>
                                                                </td>
                                                            </tr>
                                                        </xsl:if>
                                                    </xsl:when>
                                    
                                                    <!-- Main Checkbox -->
                                                    <xsl:when test="@type='CheckBoxList'">
                                                        <xsl:if test="boolean(LISTITEMS/LISTITEM/@Selected = 'true')">
                                                            <tr>
                                                                <xsl:apply-templates select = "@label" />
                                                                <td width="70%" align="left" valign="middle">
                                                                    <xsl:for-each select="LISTITEMS/LISTITEM[@Selected = 'true']">
                                                                        <xsl:value-of select="concat(' ' , @value)" />
                                                                        <xsl:if test="not(position() = last())">,</xsl:if>
                                                                    </xsl:for-each>
                                                                    <xsl:if test="FIELD">
                                                                        <span>
                                                                            <xsl:attribute name="id">
                                                                                <xsl:value-of select="@Backdivid"></xsl:value-of>
                                                                            </xsl:attribute>
                                                                            <xsl:attribute name="class">
                                                                                <xsl:value-of select="@Backcontrols"></xsl:value-of>
                                                                            </xsl:attribute>
                                                                            <xsl:for-each select="FIELD">
                                                                                <xsl:choose>
                                                                                    <xsl:when test="@type='TextBox'">
                                                                                        <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                                            <xsl:if test="@name='value'"> |
                                                                                                <span id="sub_textbox">
                                                                                                    <xsl:value-of select="current()"></xsl:value-of>
                                                                                                </span>
                                                                                            </xsl:if>
                                                                                        </xsl:for-each>
                                                                                    </xsl:when>
                                                                                </xsl:choose>
                                                                            </xsl:for-each>
                                                                        </span>
                                                                    </xsl:if>
                                                                </td>
                                                            </tr>
                                                        </xsl:if>
                                                    </xsl:when>
                                                </xsl:choose>
                                            </xsl:for-each>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                
                    <xsl:for-each select="PANELBODY/FIELD[@type='textareaFull' and @id='history_presenting_illness']">
                        <xsl:if test="VALUE and VALUE!=''">
                            <tr>
                                <td id="history_presenting" colspan="2" align="left" valign="top">
                                    <xsl:attribute name="class">
                                        <xsl:for-each select="PROPERTIES/PROPERTY">
                                            <xsl:if test="@name='class'">
                                                <p>
                                                    <xsl:value-of select="current()"></xsl:value-of>
                                                </p>
                                            </xsl:if>
                                        </xsl:for-each>
                                    </xsl:attribute>
                                    <xsl:value-of select="VALUE" ></xsl:value-of>
                                </td>
                            </tr>
                        </xsl:if>
                    </xsl:for-each>
                                
                    <tr>
                        <td colspan="2" align="left" valign="top">
                            <table width="100%" border="0" cellspacing="0" cellpadding="0" class="print-friendly">
                                <xsl:for-each select="PANELBODY/FIELD[@type='Header2' and @label='Associated Disturbances']">
                                    <tr>
                                        <td colspan="2" align="left" valign="top" class="ribbon">
                                            <h2 style="font-family:Arial, Helvetica, sans-serif;">
                                                <xsl:value-of select="@label" />
                                            </h2>
                                        </td>
                                    </tr>
                                </xsl:for-each>
                        
                                <!-- Associated Disturbances list-->
                                <tr>
                                    <td colspan="2" align="left" valign="top">
                                        <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                            <tr>
                                                <xsl:for-each select="PANELBODY/FIELD[@type='RadioButtonList' and ((@id='sleep') or (@id='appetite') or (@id='weight') or (@id='sexual_functioning') or (@id='social_functioning') or (@id='occupational_functioning'))]">
                                                    <xsl:if test="boolean(LISTITEMS/LISTITEM/@Selected = 'true')">
                                                        <td width="25%" align="left" valign="top" class="small-left-heading">
                                                            <xsl:value-of select="@label" />
                                                            <span class="colon"> : </span>
                                                        </td>
                                                        <td width="25%" align="left" valign="top">
                                                            <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                <xsl:if test="@Selected = 'true'">
                                                                    <xsl:value-of select="current()"></xsl:value-of>
                                                                </xsl:if>
                                                            </xsl:for-each>
                                                            <xsl:if test="FIELD">
                                                                <span>
                                                                    <xsl:attribute name="id">
                                                                        <xsl:value-of select="@Backdivid"></xsl:value-of>
                                                                    </xsl:attribute>
                                                                    <xsl:attribute name="class">
                                                                        <xsl:value-of select="@Backcontrols"></xsl:value-of>
                                                                    </xsl:attribute>
                                                                    <xsl:for-each select="FIELD">
                                                                        <xsl:choose>
                                                                            <xsl:when test="@type='RadioButtonList'">
                                                                                <span> |
                                                                                    <!--                                                                        <xsl:value-of select="@label" />-->
                                                                                    <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                                        <xsl:if test="@Selected = 'true'">
                                                                                            <xsl:value-of select="current()"></xsl:value-of>
                                                                                        </xsl:if>
                                                                                    </xsl:for-each>
                                                                                </span>
                                                                            </xsl:when>
                                                                        </xsl:choose>
                                                                    </xsl:for-each>
                                                                </span>
                                                            </xsl:if>
                                                        </td>
                                                        <xsl:variable name="i" select="position() mod 2 = 1"/>
                                                        <xsl:if test="$i=false">
                                                            <tr> </tr> 
                                                        </xsl:if>
                                                    </xsl:if>
                                                </xsl:for-each>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <span id='hide_span'>Hiding text</span>
                                                </td>
                                            </tr>
                            
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>            
                
                    
                    <tr>
                        <td colspan="2" align="left" valign="top">
                            <table width="100%" border="0" cellspacing="0" cellpadding="0" class="print-friendly">
                                <xsl:for-each select="PANELBODY/FIELD[@type='Header2' and @label='Past Psychiatric History']">
                                    <tr>
                                        <td colspan="2" align="left" valign="top" class="ribbon">
                                            <h2 style="font-family:Arial, Helvetica, sans-serif;">
                                                <xsl:value-of select="@label" />
                                            </h2>
                                        </td>
                                    </tr>
                                </xsl:for-each>
                
                                <!-- past psychiatric history-->
                                <tr>
                                    <td align="left" valign="top">
                                        <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                            <xsl:for-each select="PANELBODY/FIELD[(@id='similar_episodes')]">
                                                <xsl:choose>
                                                    <xsl:when test="@type='RadioButtonList'">
                                                        <xsl:if test="boolean(LISTITEMS/LISTITEM/@Selected = 'true')">
                                                            <tr>
                                                                <td width="25%" align="left" valign="top" class="small-left-heading">
                                                                    <xsl:value-of select="@label" />
                                                                </td>
                                                                <td  width="25%" align="left" valign="top">
                                                                    <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                        <xsl:if test="@Selected = 'true'">
                                                                            <xsl:value-of select="current()"></xsl:value-of>
                                                                        </xsl:if>
                                                                    </xsl:for-each>
                                                                    <xsl:if test="FIELD">
                                                                        <span>
                                                                            <xsl:attribute name="id">
                                                                                <xsl:value-of select="@Backdivid"></xsl:value-of>
                                                                            </xsl:attribute>
                                                                            <xsl:attribute name="class">
                                                                                <xsl:value-of select="@Backcontrols"></xsl:value-of>
                                                                            </xsl:attribute>
                                                                            <xsl:for-each select="FIELD">
                                                                                <xsl:choose>
                                                                                    <xsl:when test="@type='DropDownList'">
                                                                                        <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                                            <xsl:if test="@Selected = 'true'">
                                                                                                <span class="reason"> [ 
                                                                                                    <xsl:value-of select="../../@label"/>  
                                                                                                    <xsl:value-of select="@value"></xsl:value-of>
                                                                                                    ] </span>
                                                                                            </xsl:if>
                                                                                        </xsl:for-each>
                                                                                    </xsl:when>
                                                                                </xsl:choose>
                                                                            </xsl:for-each>
                                                                        </span>
                                                                    </xsl:if>
                                                                </td>
                                                            </tr>
                                                        </xsl:if>
                                                    </xsl:when>
                                                </xsl:choose>
                                            </xsl:for-each>
                                            <tr>
                                                <td>
                                                    <span id='hide_span'>Hiding text</span>
                                                </td> 
                                            </tr>
                                            <xsl:for-each select="PANELBODY/FIELD[@type='TextArea' and @id='past_psychiatric_history']">
                                                <xsl:if test="VALUE and VALUE!=''">
                                                    <tr>
                                                        <td colspan="4" align="left" valign="top" class="notes">
                                                            <strong>
                                                                <xsl:value-of select="@label" /> :
                                                            </strong>
                                                            <xsl:call-template name="LFsToBRs">
                                                                <xsl:with-param name="input" select="VALUE"/>
                                                            </xsl:call-template>
                                                        </td>
                                                    </tr>
                                                </xsl:if>
                                            </xsl:for-each>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                
                    <tr>
                        <td colspan="2" align="left" valign="top">
                            <table width="100%" border="0" cellspacing="0" cellpadding="0" class="print-friendly">
                                <!-- Past medical history-->
                                <xsl:for-each select="PANELBODY/FIELD[@type='Header2' and @label='Past Medical History']">
                                    <tr>
                                        <td colspan="2" align="left" valign="top" class="ribbon">
                                            <h2 style="font-family:Arial, Helvetica, sans-serif;">
                                                <xsl:value-of select="@label" />
                                            </h2>
                                        </td>
                                    </tr>
                                </xsl:for-each>
                
                                <!-- Past medical history complaints-->
                                <tr class="pastmedical">
                                    <td align="left" valign="top" class="table2 table4">
                                        <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                            <xsl:for-each select="PANELBODY/FIELD[@type='RadGrid' and @ADDButtonID='RGMedHisadd']">
                                                <xsl:for-each select="PROPERTIES/PROPERTY">
                                                    <xsl:attribute name="{@name}">
                                                        <xsl:value-of select="current()"></xsl:value-of>
                                                    </xsl:attribute>
                                                </xsl:for-each>
                                                <thead>
                                                    <tr>
                                                        <xsl:for-each select="HEADER/TH">
                                                            <td class="inner-table-heading">
                                                                <strong>
                                                                    <xsl:value-of select="current()" />
                                                                </strong>
                                                            </td>
                                                        </xsl:for-each>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <xsl:for-each select="COLUMNS">
                                                        <tr>
                                                            <xsl:for-each select="FIELD">
                                                                <td class="">
                                                                    <xsl:choose>
                                                                        <!-- Main Text Box With DropDownList-->
                                                                        <xsl:when test="@type='TextBoxDDL'">
                                                                            <xsl:if test="PROPERTIES/PROPERTY[@name = 'value' and string(.)]">
                                                                                <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                                    <xsl:if test="@name='value'">
                                                                                        <xsl:value-of select="current()"></xsl:value-of>
                                                                                    </xsl:if>
                                                                                    <xsl:value-of select="@Backtext"></xsl:value-of>
                                                                                </xsl:for-each>
                                                                                    &#160;
                                                                                <xsl:for-each select="FIELD/LISTITEMS/LISTITEM">
                                                                                    <xsl:if test="@Selected = 'true'">
                                                                                            &#160;
                                                                                        <xsl:value-of select="@value"></xsl:value-of>
                                                                                    </xsl:if>
                                                                                </xsl:for-each>
                                                                            </xsl:if>
                                                                        </xsl:when>
                                                                    
                                                                        <xsl:when test="@type='DropDownList'">
                                                                            <xsl:if test="boolean(LISTITEMS/LISTITEM/@Selected = 'true')">
                                                                                <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                                    <xsl:if test="@Selected = 'true'">
                                                                                                            &#160;
                                                                                        <xsl:value-of select="@value"></xsl:value-of>
                                                                                    </xsl:if>
                                                                                </xsl:for-each>
                                                                            </xsl:if>
                                                                        </xsl:when>
                                                                    
                                                                        <xsl:when test="@type='RadioButtonList'">
                                                                            <xsl:if test="boolean(LISTITEMS/LISTITEM/@Selected = 'true')">
                                                                                <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                                    <xsl:if test="@Selected = 'true'">
                                                                                        <xsl:value-of select="current()"></xsl:value-of>
                                                                                    </xsl:if>
                                                                                </xsl:for-each>
                                                                                <xsl:if test="FIELD">
                                                                                    <span class="reason">
                                                                                        <xsl:attribute name="id">
                                                                                            <xsl:value-of select="@Backdivid"></xsl:value-of>
                                                                                        </xsl:attribute>
                                                                                        <xsl:attribute name="class">
                                                                                            <xsl:value-of select="@Backcontrols"></xsl:value-of>
                                                                                        </xsl:attribute>
                                                                                        <xsl:for-each select="FIELD">
                                                                                            <xsl:choose>
                                                                                                <xsl:when test="@type='TextBox'">
                                                                                                    <xsl:if test="PROPERTIES/PROPERTY[@name = 'value' and string(.)]">
                                                                                                        <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                                                            <xsl:if test="@name='value'">
                                                                                                                [ <xsl:value-of select="current()"></xsl:value-of> ]
                                                                                                            </xsl:if>
                                                                                                        </xsl:for-each>
                                                                                                    </xsl:if>
                                                                                                </xsl:when>
                                                                                            </xsl:choose>
                                                                                        </xsl:for-each>
                                                                                    </span>
                                                                                </xsl:if>
                                                                            </xsl:if>
                                                                        </xsl:when>
                                                                    </xsl:choose>
                                                                </td>
                                                            </xsl:for-each>
                                                        </tr>
                                    
                                                    </xsl:for-each>
                                                </tbody>
                                            </xsl:for-each>
                                            <xsl:for-each select="PANELBODY/FIELD[@type='TextArea' and @id='past_medical_history_notes']">
                                                <xsl:if test="VALUE and VALUE!=''">
                                                    <tr>
                                                        <td colspan="4" align="left" valign="top" class="notes">
                                                            <strong>
                                                                <xsl:value-of select="@label" /> :
                                                            </strong>
                                                            <xsl:call-template name="LFsToBRs">
                                                                <xsl:with-param name="input" select="VALUE"/>
                                                            </xsl:call-template>
                                                        </td>
                                                    </tr>
                                                </xsl:if>
                                            </xsl:for-each>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                
                    <!-- Treatment History -->
                    <xsl:for-each select="PANELBODY/FIELD[@type='PanelBar' and @label='Treatment History']">
                        <tr class="treatment_history_head">
                            <td colspan="2" align="left" valign="top" class="ribbon" style="color:#ffffff;">
                                <h1 style="font-family:Arial, Helvetica, sans-serif;">
                                    <xsl:value-of select="@label" />
                                </h1>
                            </td>
                        </tr>
                    </xsl:for-each>
                
                    <tr class="treatment">
                        <td>
                            <tr class="treatment_history">
                                <td colspan="2" align="left" valign="top">
                                    <table width="100%" border="0" cellspacing="0" cellpadding="0" class="print-friendly">
                                        <xsl:for-each select="PANELBODY/FIELD/FIELD[@type='Header2' and @label='Phamacotherapy']">
                                            <tr>
                                                <td align="left" valign="top" class="ribbon">
                                                    <h2 style="font-family:Arial, Helvetica, sans-serif;">   
                                                        <xsl:value-of select="@label" />  
                                                    </h2>
                                                </td>
                                            </tr>
                                        </xsl:for-each>
                
                                        <tr class='phamacotherapy'>
                                            <td align="left" valign="top" class="table2 table4">
                                                <table width="100%" border="0" cellpadding="0" cellspacing="0">
                                                    <xsl:for-each select="PANELBODY/FIELD/FIELD[@type='RadGrid' and @ADDButtonID='RGPhamacoadd']">
                                                        <xsl:choose>
                                                            <xsl:when test="@type='RadGrid' and not(@ADDButtonID='RGCompliantadd')">
                                                                <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                    <xsl:attribute name="{@name}">
                                                                        <xsl:value-of select="current()"></xsl:value-of>
                                                                    </xsl:attribute>
                                                                </xsl:for-each>
                                                                <thead>
                                                                    <tr class="RadGrid">
                                                                        <xsl:for-each select="HEADER/TH">
                                                                            <td width="25%" class="inner-table-heading">
                                                                                <strong>
                                                                                    <xsl:value-of select="current()" />
                                                                                </strong>
                                                                            </td>
                                                                        </xsl:for-each>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    <xsl:for-each select="COLUMNS">
                                                                        <tr>
                                                                            <xsl:for-each select="FIELD">
                                                                                <td>
                                                                                    <xsl:choose>
                                                                                        <!-- Text Box -->
                                                                                        <xsl:when test="@type='TextBox'">
                                                                                            <xsl:if test="PROPERTIES/PROPERTY[@name = 'value' and string(.)]">
                                                                                                <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                                                    <xsl:if test="@name='value'">
                                                                                                        <xsl:value-of select="current()"></xsl:value-of>
                                                                                                    </xsl:if>
                                                                                                </xsl:for-each>
                                                                                            </xsl:if>
                                                                                        </xsl:when>
                                                                        
                                                                                        <!-- Main Text Box With DropDownList-->
                                                                                        <xsl:when test="@type='TextBoxDDL'">
                                                                                            <xsl:if test="PROPERTIES/PROPERTY[@name = 'value' and string(.)]">
                                                                                                <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                                                    <xsl:if test="@name='value'">
                                                                                                        <xsl:value-of select="current()"></xsl:value-of>
                                                                                                    </xsl:if>
                                                                                                    <xsl:value-of select="@Backtext"></xsl:value-of>
                                                                                                </xsl:for-each>
                                                                                    &#160;
                                                                                                <xsl:for-each select="FIELD/LISTITEMS/LISTITEM">
                                                                                                    <xsl:if test="@Selected = 'true'">
                                                                                            &#160;
                                                                                                        <xsl:value-of select="@value"></xsl:value-of>
                                                                                                    </xsl:if>
                                                                                                </xsl:for-each>
                                                                                            </xsl:if>
                                                                                        </xsl:when>
                                                                        
                                                                                        <!-- Drop Down List -->
                                                                                        <xsl:when test="@type='DropDownList'">
                                                                                            <xsl:if test="boolean(LISTITEMS/LISTITEM/@Selected = 'true')">
                                                                                                <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                                                    <xsl:if test="@Selected = 'true'">
                                                                                        &#160;
                                                                                                        <xsl:value-of select="@value"></xsl:value-of>
                                                                                                    </xsl:if>
                                                                                                </xsl:for-each>
                                                                                            </xsl:if>
                                                                                        </xsl:when>
                                                                    
                                                                                        <!-- Radio Button -->
                                                                                        <xsl:when test="@type='RadioButtonList'">
                                                                                            <xsl:if test="boolean(LISTITEMS/LISTITEM/@Selected = 'true')">
                                                                                &#160;
                                                                                                <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                                                    <xsl:if test="@Selected = 'true'">
                                                                                                        <xsl:value-of select="current()"></xsl:value-of>
                                                                                                    </xsl:if>
                                                                                                </xsl:for-each>
                                                                                                <xsl:if test="FIELD">
                                                                                                    <span>
                                                                                                        <xsl:attribute name="id">
                                                                                                            <xsl:value-of select="@Backdivid"></xsl:value-of>
                                                                                                        </xsl:attribute>
                                                                                                        <xsl:attribute name="class">
                                                                                                            <xsl:value-of select="@Backcontrols"></xsl:value-of>
                                                                                                        </xsl:attribute>
                                                                                                        <xsl:for-each select="FIELD">
                                                                                                            <xsl:choose>
                                                                                                                <xsl:when test="@type='MultiDropDownList'">
                                                                                                                    <xsl:if test="boolean(LISTITEMS/LISTITEM/@Selected = 'true')"> [
                                                                                                                        <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                                                                            <xsl:if test="@Selected = 'true'">
                                                                                                                                <xsl:value-of select="concat(' ' , @value)" />
                                                                                                                                <xsl:if test="not(position() = last())">,</xsl:if>
                                                                                                                            </xsl:if>
                                                                                                                        </xsl:for-each> ]
                                                                                                                    </xsl:if>
                                                                                                                </xsl:when>
                                                                                                            </xsl:choose>
                                                                                                        </xsl:for-each>
                                                                                                    </span>
                                                                                                </xsl:if>
                                                                                            </xsl:if>
                                                                                        </xsl:when>
                                                                                    </xsl:choose>
                                                                                </td>
                                                                            </xsl:for-each>
                                                                        </tr>
                                                                    </xsl:for-each>
                                                                </tbody>
                                                            </xsl:when>
                                                        </xsl:choose>
                                                    </xsl:for-each>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                
                            <tr class="treatment_history">
                                <td align="left" valign="top">
                                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                        <tr>
                                            <xsl:for-each select="PANELBODY/FIELD/FIELD[@type='RadioButtonList' and @id='rb_pb_treatmenthistory']">
                                                <xsl:choose>
                                                    <xsl:when test="@type='RadioButtonList'">
                                                        <xsl:if test="boolean(LISTITEMS/LISTITEM/@Selected = 'true')">
                                                            <td colspan="2" width="50%" align="left" valign="top" class="small-left-heading">
                                                                <xsl:value-of select="@label" /> 
                                                                <span class="colon"> : </span>
                                                            </td>
                                                            <td colspan="2" width="50%" align="left" valign="top">
                                                                <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                    <xsl:if test="@Selected = 'true'">
                                                                        <xsl:value-of select="current()"></xsl:value-of>
                                                                    </xsl:if>
                                                                </xsl:for-each>
                                                                <xsl:if test="FIELD">
                                                                    <span>
                                                                        <xsl:attribute name="id">
                                                                            <xsl:value-of select="@Backdivid"></xsl:value-of>
                                                                        </xsl:attribute>
                                                                        <xsl:attribute name="class">
                                                                            <xsl:value-of select="@Backcontrols"></xsl:value-of>
                                                                        </xsl:attribute>
                                                                        <xsl:for-each select="FIELD">
                                                                            <xsl:choose>
                                                                                <xsl:when test="@type='RadioButtonList'">
                                                                                    <br/>
                                                                                    <xsl:value-of select="@label" />&#160;
                                                                                    <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                                        <xsl:if test="@Selected = 'true'">
                                                                                            <span id="sub_textbox">
                                                                                                <xsl:value-of select="current()"></xsl:value-of>
                                                                                            </span>
                                                                                        </xsl:if>
                                                                                    </xsl:for-each>
                                                                                </xsl:when>
                                                                            </xsl:choose>
                                                                        </xsl:for-each>
                                                                    </span>
                                                                </xsl:if>
                                                            </td>
                                                        </xsl:if>
                                                    </xsl:when>
                                                </xsl:choose>
                                            </xsl:for-each>
                                        </tr>
                                        <tr>
                                            <td>
                                                <span id='hide_span'>Hiding text</span>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                
                            <tr class="treatment_history">
                                <td colspan="2" align="left" valign="top">
                                    <table width="100%" border="0" cellspacing="0" cellpadding="0" class="print-friendly">
                                        <!-- electro convulsive therapy -->
                                        <xsl:for-each select="PANELBODY/FIELD/FIELD[@type='Header2' and @label='Electro Convulsive therapy']">
                                            <tr>
                                                <td align="left" valign="top" class="ribbon">
                                                    <h2 style="font-family:Arial, Helvetica, sans-serif;">   
                                                        <xsl:value-of select="@label" />  
                                                    </h2>
                                                </td>
                                            </tr>
                                        </xsl:for-each>
                
                                        <!-- electro convulsive therapy list-->
                                        <tr>
                                            <td align="left" valign="top">
                                                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                                    <tr>
                                                        <xsl:for-each select="PANELBODY/FIELD/FIELD[@type='RadioButtonList' and @id='previous_ects']">
                                                            <xsl:choose>
                                                                <xsl:when test="@type='RadioButtonList'">
                                                                    <xsl:if test="boolean(LISTITEMS/LISTITEM/@Selected = 'true')">
                                                                        <td width="50%" align="left" valign="top" class="small-left-heading">
                                                                            <xsl:value-of select="@label" /> 
                                                                            <span class="colon"> : </span>
                                                                        </td>
                                                                        <td width="50%" align="left" valign="middle">
                                                                            <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                                <xsl:if test="@Selected = 'true'">
                                                                                    <xsl:value-of select="current()"></xsl:value-of>
                                                                                </xsl:if>
                                                                            </xsl:for-each>
                                                                            <xsl:if test="FIELD">
                                                                                <span>
                                                                                    <xsl:attribute name="id">
                                                                                        <xsl:value-of select="@Backdivid"></xsl:value-of>
                                                                                    </xsl:attribute>
                                                                                    <xsl:attribute name="class">
                                                                                        <xsl:value-of select="@Backcontrols"></xsl:value-of>
                                                                                    </xsl:attribute>
                                                                                    <xsl:for-each select="FIELD">
                                                                                        <xsl:choose>
                                                                                            <xsl:when test="@type='DropDownList'">
                                                                                                <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                                                    <xsl:if test="@Selected = 'true'">
                                                                                                        <tr>
                                                                                                            <td width="40%" align="left" valign="top" class="small-left-heading">
                                                                                                                <xsl:value-of select="../../@label"/>
                                                                                                            </td>
                                                                                                            <td width="60%" align="left" valign="top">
                                                                                                                <xsl:value-of select="@value"/>
                                                                                                            </td>
                                                                                                        </tr>
                                                                                                    </xsl:if>
                                                                                                </xsl:for-each>
                                                                                            </xsl:when>
                                                                                            <xsl:when test="@type='TextBox'">
                                                                                                <xsl:if test="PROPERTIES/PROPERTY[@name = 'value' and string(.)]">
                                                                                                    <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                                                        <xsl:if test="@name='value'">
                                                                                                            <tr>
                                                                                                                <td width="40%" align="left" valign="top" class="small-left-heading">
                                                                                                                    <xsl:value-of select="../../@label"/>
                                                                                                                </td>
                                                                                                                <td width="60%" align="left" valign="top">
                                                                                                                    <xsl:value-of select="current()"/>
                                                                                                                </td>
                                                                                                            </tr>
                                                                                    
                                                                                                        </xsl:if>
                                                                                                    </xsl:for-each>
                                                                                                </xsl:if>
                                                                                            </xsl:when>
                                                                                        </xsl:choose>
                                                                                    </xsl:for-each>
                                                                                </span>
                                                                            </xsl:if>
                                                                        </td>
                                                                    </xsl:if>
                                                                </xsl:when>
                                                            </xsl:choose>
                                                        </xsl:for-each>
                                                    </tr>
                                                    <tr>
                                                        <td>
                                                            <span id='hide_span'>Hiding text</span>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>

                            <tr class="treatment_history">
                                <td colspan="2" align="left" valign="top">
                                    <table width="100%" border="0" cellspacing="0" cellpadding="0" class="print-friendly">
                                        <!-- Counselling/psychotherapy heading-->
                                        <xsl:for-each select="PANELBODY/FIELD/FIELD[@type='Header2' and @label='Counselling / Psychotherapy']">
                                            <tr>
                                                <td align="left" valign="top" class="ribbon">
                                                    <h2 style="font-family:Arial, Helvetica, sans-serif;">   
                                                        <xsl:value-of select="@label" />  
                                                    </h2>
                                                </td>
                                            </tr>
                                        </xsl:for-each>
                
                                        <!-- Counselling/psychotherapy List-->
                                        <tr>
                                            <td colspan="2" align="left" valign="top">
                                                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                                    <tr>
                                                        <xsl:for-each select="PANELBODY/FIELD/FIELD[((@type='RadioButtonList') or (@type='TextBox')) and ((@id='rb_pb_mostrecentepisode') or (@id='rb_pb_Response') or (@id='txt_pb_no_of_sessions'))]">
                                                            <xsl:choose>
                                                                <xsl:when test="@type='RadioButtonList'">
                                                                    <xsl:if test="boolean(LISTITEMS/LISTITEM/@Selected = 'true')">
                                                                        <td width="25%" align="left" valign="top" class="small-left-heading">
                                                                            <xsl:value-of select="@label" />
                                                                            <span class="colon"> : </span>
                                                                        </td>
                                                                        <td width="25%" align="left" valign="top">
                                                                            <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                                <xsl:if test="@Selected = 'true'">
                                                                                    <xsl:value-of select="current()"></xsl:value-of>
                                                                                </xsl:if>
                                                                            </xsl:for-each>
                                                                            <xsl:if test="FIELD">
                                                                                <span>
                                                                                    <xsl:attribute name="id">
                                                                                        <xsl:value-of select="@Backdivid"></xsl:value-of>
                                                                                    </xsl:attribute>
                                                                                    <xsl:attribute name="class">
                                                                                        <xsl:value-of select="@Backcontrols"></xsl:value-of>
                                                                                    </xsl:attribute>
                                                                                    <xsl:for-each select="FIELD">
                                                                                        <xsl:choose>
                                                                                            <xsl:when test="@type='RadioButtonList'">
                                                                                                <span>
                                                                                                    <xsl:value-of select="@label" />
                                                                                                    <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                                                        <xsl:if test="@Selected = 'true'">
                                                                                                            <strong>
                                                                                                                <xsl:value-of select="current()"></xsl:value-of>
                                                                                                            </strong>
                                                                                                        </xsl:if>
                                                                                                    </xsl:for-each>
                                                                                                </span>
                                                                                            </xsl:when>
                                                                                        </xsl:choose>
                                                                                    </xsl:for-each>
                                                                                </span>
                                                                            </xsl:if>
                                                                        </td>
                                                
                                                                    </xsl:if>
                                                                </xsl:when>
                                                                <!-- Main Text Box -->
                                        
                                                                <xsl:when test="@type='TextBox'">
                                                                    <xsl:if test="PROPERTIES/PROPERTY[@name = 'value' and string(.)]">
                                                                        <td width="125" class="small-left-heading">
                                                                            <xsl:value-of select="@label" />
                                                                            <span class="colon"> : </span>
                                                                        </td>
                                                                        <td>
                                                                            <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                                <xsl:if test="@name='value'">
                                                                                    <xsl:value-of select="current()"></xsl:value-of>
                                                                                    <xsl:value-of select="../../@Backtext"></xsl:value-of>
                                                                                </xsl:if>
                                                                            </xsl:for-each>
                                                                        </td>
                                                                        <xsl:variable name="i" select="position() mod 2 = 1"/>
                                                                        <xsl:if test="$i=false">
                                                                            <tr> </tr> 
                                                                        </xsl:if>
                                                                    </xsl:if>
                                                                </xsl:when>
                                                            </xsl:choose>
                                                        </xsl:for-each>
                                                    </tr>
                                                    <tr>
                                                        <td>
                                                            <span id='hide_span'>Hiding text</span>
                                                        </td>
                                                    </tr>
                            
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            
                            <tr class="treatment_history">
                                <td colspan="2" align="left" valign="top">
                                    <table width="100%" border="0" cellspacing="0" cellpadding="0" class="print-friendly">
                                        <!--Alternative Therapies Heading-->
                                        <xsl:for-each select="PANELBODY/FIELD/FIELD[@type='Header2' and @label='Alternative Therapies']">
                                            <tr>
                                                <td align="left" valign="top" class="ribbon">
                                                    <h2 style="font-family:Arial, Helvetica, sans-serif;">   
                                                        <xsl:value-of select="@label" />  
                                                    </h2>
                                                </td>
                                            </tr>
                                        </xsl:for-each>
                
                                        <!--Alternative Therapies Details-->
                                        <tr class="alternative">
                                            <td align="left" valign="top" class="table2 table4">
                                                <table width="100%" border="0" cellpadding="0" cellspacing="0">
                                                    <xsl:for-each select="PANELBODY/FIELD/FIELD[@type='RadGrid' and @ADDButtonID='RGaltadd']">
                                                        <xsl:choose>
                                                            <xsl:when test="@type='RadGrid' and not(@ADDButtonID='RGCompliantadd')">
                                                                <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                    <xsl:attribute name="{@name}">
                                                                        <xsl:value-of select="current()"></xsl:value-of>
                                                                    </xsl:attribute>
                                                                </xsl:for-each>
                                                                <thead>
                                                                    <tr class="RadGrid">
                                                                        <xsl:for-each select="HEADER/TH">
                                                                            <td class="inner-table-heading">
                                                                                <strong>
                                                                                    <xsl:value-of select="current()" />
                                                                                </strong>
                                                                            </td>
                                                                        </xsl:for-each>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    <xsl:for-each select="COLUMNS">
                                                                        <tr>
                                                                            <xsl:for-each select="FIELD">
                                                                                <td>
                                                                                    <xsl:choose>
                                                                                        <!-- Drop Down List -->
                                                                                        <xsl:when test="@type='DropDownList'">
                                                                                            <xsl:if test="boolean(LISTITEMS/LISTITEM/@Selected = 'true')">
                                                                                                <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                                                    <xsl:if test="@Selected = 'true'">
                                                                                        &#160;
                                                                                                        <xsl:value-of select="@value"></xsl:value-of>
                                                                                                    </xsl:if>
                                                                                                </xsl:for-each>
                                                                                            </xsl:if>
                                                                                        </xsl:when>
                                                                    
                                                                                        <!-- Radio Button -->
                                                                                        <xsl:when test="@type='RadioButtonList'">
                                                                                            <xsl:if test="boolean(LISTITEMS/LISTITEM/@Selected = 'true')">
                                                                                &#160;
                                                                                                <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                                                    <xsl:if test="@Selected = 'true'">
                                                                                                        <xsl:value-of select="current()"></xsl:value-of>
                                                                                                    </xsl:if>
                                                                                                </xsl:for-each>
                                                                                                <xsl:if test="FIELD">
                                                                                                    <span>
                                                                                                        <xsl:attribute name="id">
                                                                                                            <xsl:value-of select="@Backdivid"></xsl:value-of>
                                                                                                        </xsl:attribute>
                                                                                                        <xsl:attribute name="class">
                                                                                                            <xsl:value-of select="@Backcontrols"></xsl:value-of>
                                                                                                        </xsl:attribute>
                                                                                                        <xsl:for-each select="FIELD">
                                                                                                            <xsl:choose>
                                                                                                                <xsl:when test="@type='DropDownList'">
                                                                                                                    <xsl:if test="boolean(LISTITEMS/LISTITEM/@Selected = 'true')">
                                                                                                                        <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                                                                            <xsl:if test="@Selected = 'true'">
                                                                                                                                <span class="reason"> 
                                                                                                                                    [ <xsl:value-of select="@value"/> ]
                                                                                                                                </span>
                                                                                                                            </xsl:if>
                                                                                                                        </xsl:for-each>
                                                                                                                    </xsl:if>
                                                                                                                </xsl:when>
                                                                                                            </xsl:choose>
                                                                                                        </xsl:for-each>
                                                                                                    </span>
                                                                                                </xsl:if>
                                                                                            </xsl:if>
                                                                                        </xsl:when>
                                                                                    </xsl:choose>
                                                                                </td>
                                                                            </xsl:for-each>
                                                                        </tr>
                                                                    </xsl:for-each>
                                                                </tbody>
                                                            </xsl:when>
                                                        </xsl:choose>
                                                    </xsl:for-each>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                
                            <!-- Main Text Area-->
                            <xsl:for-each select="PANELBODY/FIELD/FIELD[@type='TextArea' and @id='treatment_history_notes']">
                                <xsl:if test="VALUE and VALUE!=''">
                                    <tr>
                                        <td colspan="4" align="left" valign="top" class="notes">
                                            <strong>
                                                <xsl:value-of select="@label"/> : </strong>
                                            <xsl:call-template name="LFsToBRs">
                                                <xsl:with-param name="input" select="VALUE"/>
                                            </xsl:call-template>
                                        </td>
                                    </tr>
                                </xsl:if>
                            </xsl:for-each>
                
                        </td>
                    </tr>
                    
                    <tr>
                        <td colspan="2" align="left" valign="top">
                            <table width="100%" border="0" cellspacing="0" cellpadding="0" class="print-friendly">
                                <!--Family History Heading-->
                                <xsl:for-each select="PANELBODY/FIELD[@type='PanelBar' and @label='Family History']">
                                    <tr>
                                        <td align="left" valign="top" class="ribbon">
                                            <h2 style="font-family:Arial, Helvetica, sans-serif;">   
                                                <xsl:value-of select="@label" />  
                                            </h2>
                                        </td>
                                    </tr>
                                </xsl:for-each>
                
                                <!-- Family History Details -->
                                <tr>
                                    <td colspan="2" align="left" valign="top">
                                        <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                            <tr>
                                                <xsl:for-each select="PANELBODY/FIELD/FIELD[@type='RadioButtonList' and ((@id='RBtypeoffamily') or (@id='RBtypeofmarriage'))]">
                                                    <xsl:if test="boolean(LISTITEMS/LISTITEM/@Selected = 'true')">
                                                        <td width="20%" align="left" valign="top" class="small-left-heading">
                                                            <xsl:value-of select="@label" /> 
                                                            <span class="colon"> : </span>
                                                        </td>
                                                        <td width="30%" align="left" valign="top">
                                                            <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                <xsl:if test="@Selected = 'true'">
                                                                    <xsl:value-of select="current()"></xsl:value-of>
                                                                </xsl:if>
                                                            </xsl:for-each>
                                                            <xsl:if test="FIELD">
                                                                <span>
                                                                    <xsl:attribute name="id">
                                                                        <xsl:value-of select="@Backdivid"></xsl:value-of>
                                                                    </xsl:attribute>
                                                                    <xsl:attribute name="class">
                                                                        <xsl:value-of select="@Backcontrols"></xsl:value-of>
                                                                    </xsl:attribute>
                                                                    <xsl:for-each select="FIELD">
                                                                        <xsl:choose>
                                                                            <xsl:when test="@type='TextBox'">
                                                                                <br/>
                                                                                <xsl:value-of select="@label" />&#160;
                                                                                <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                                    <xsl:if test="@name='value'">
                                                                                        <span id="sub_textbox">
                                                                                            <xsl:value-of select="current()"></xsl:value-of>
                                                                                        </span>
                                                                                    </xsl:if>
                                                                                </xsl:for-each>
                                                                            </xsl:when>
                                                            
                                                                            <xsl:when test="@type='RadioButtonList'">
                                                                                <br/>
                                                                                <xsl:value-of select="@label" />&#160;
                                                                                <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                                    <xsl:if test="@Selected = 'true'">
                                                                                        <span id="sub_textbox">
                                                                                            <xsl:value-of select="current()"></xsl:value-of>
                                                                                        </span>
                                                                                    </xsl:if>
                                                                                </xsl:for-each>
                                                                            </xsl:when>
                                                            
                                                                            <xsl:when test="@type='DropDownList'">
                                                                                <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                                    <xsl:if test="@Selected = 'true'">
                                                                                        <br/>
                                                                                        <xsl:value-of select="../../@label"/>  
                                                                                        <xsl:value-of select="@value"></xsl:value-of>
                                                                                    </xsl:if>
                                                                                </xsl:for-each>
                                                                            </xsl:when>
                                                                        </xsl:choose>
                                                                    </xsl:for-each>
                                                                </span>
                                                            </xsl:if>
                                                        </td>
                                                    </xsl:if>
                                                </xsl:for-each>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <span id='hide_span'>Hiding text</span>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>     
                            </table>
                        </td>
                    </tr>
                
                    <tr>
                        <td align="left" valign="top" class="table2 table4">
                            <table width="100%" border="0" cellpadding="0" cellspacing="0" >
                                <xsl:for-each select="PANELBODY/FIELD/FIELD[@type='RadGrid' and @ADDButtonID='RGfamilyadd']">
                                    <xsl:choose>
                                        <xsl:when test="@type='RadGrid' and not(@ADDButtonID='RGCompliantadd')">
                                            <xsl:for-each select="PROPERTIES/PROPERTY">
                                                <xsl:attribute name="{@name}">
                                                    <xsl:value-of select="current()"></xsl:value-of>
                                                </xsl:attribute>
                                            </xsl:for-each>
                                            <thead>
                                                <tr>
                                                    <xsl:for-each select="HEADER/TH">
                                                        <td class="inner-table-heading">
                                                            <strong>
                                                                <xsl:value-of select="current()" />
                                                            </strong>
                                                        </td>
                                                    </xsl:for-each>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <xsl:for-each select="COLUMNS">
                                                    <tr>
                                                        <xsl:for-each select="FIELD">
                                                            <td>
                                                                <xsl:choose>
                                                                    <!-- Text Box -->
                                                                    <xsl:when test="@type='TextBox'">
                                                                        <xsl:if test="PROPERTIES/PROPERTY[@name = 'value' and string(.)]">
                                                                            <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                                <xsl:if test="@name='value'">
                                                                                    <xsl:value-of select="current()"></xsl:value-of>
                                                                                </xsl:if>
                                                                            </xsl:for-each>
                                                                        </xsl:if>
                                                                    </xsl:when>
                                                                        
                                                                    <!-- Main Text Box With DropDownList-->
                                                                    <xsl:when test="@type='TextBoxDDL'">
                                                                        <xsl:if test="PROPERTIES/PROPERTY[@name = 'value' and string(.)]">
                                                                            <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                                <xsl:if test="@name='value'">
                                                                                    <xsl:value-of select="current()"></xsl:value-of>
                                                                                </xsl:if>
                                                                                <xsl:value-of select="@Backtext"></xsl:value-of>
                                                                            </xsl:for-each>
                                                                                    &#160;
                                                                            <xsl:for-each select="FIELD/LISTITEMS/LISTITEM">
                                                                                <xsl:if test="@Selected = 'true'">
                                                                                            &#160;
                                                                                    <xsl:value-of select="@value"></xsl:value-of>
                                                                                </xsl:if>
                                                                            </xsl:for-each>
                                                                        </xsl:if>
                                                                    </xsl:when>
                                                                        
                                                                    <!-- Drop Down List -->
                                                                    <xsl:when test="@type='DropDownList'">
                                                                        <xsl:if test="boolean(LISTITEMS/LISTITEM/@Selected = 'true')">
                                                                            <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                                <xsl:if test="@Selected = 'true'">
                                                                                        &#160;
                                                                                    <xsl:value-of select="@value"></xsl:value-of>
                                                                                </xsl:if>
                                                                            </xsl:for-each>
                                                                        </xsl:if>
                                                                    </xsl:when>
                                                                    
                                                                    <!-- Radio Button -->
                                                                    <xsl:when test="@type='RadioButtonList'">
                                                                        <xsl:if test="boolean(LISTITEMS/LISTITEM/@Selected = 'true')">
                                                                                &#160;
                                                                            <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                                <xsl:if test="@Selected = 'true'">
                                                                                    <xsl:value-of select="current()"></xsl:value-of>
                                                                                </xsl:if>
                                                                            </xsl:for-each>
                                                                            <xsl:if test="FIELD">
                                                                                <span>
                                                                                    <xsl:attribute name="id">
                                                                                        <xsl:value-of select="@Backdivid"></xsl:value-of>
                                                                                    </xsl:attribute>
                                                                                    <xsl:attribute name="class">
                                                                                        <xsl:value-of select="@Backcontrols"></xsl:value-of>
                                                                                    </xsl:attribute>
                                                                                    <xsl:for-each select="FIELD">
                                                                                        <xsl:choose>
                                                                                            <xsl:when test="@type='DropDownList'">
                                                                                                <xsl:if test="boolean(LISTITEMS/LISTITEM/@Selected = 'true')">
                                                                                                    <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                                                        <xsl:if test="@Selected = 'true'">
                                                                                                            <span class="reason"> 
                                                                                                                [ <xsl:value-of select="@value"/> ]
                                                                                                            </span>
                                                                                                        </xsl:if>
                                                                                                    </xsl:for-each>
                                                                                                </xsl:if>
                                                                                            </xsl:when>
                                                                                        </xsl:choose>
                                                                                    </xsl:for-each>
                                                                                </span>
                                                                            </xsl:if>
                                                                        </xsl:if>
                                                                    </xsl:when>
                                                                </xsl:choose>
                                                            </td>
                                                        </xsl:for-each>
                                                    </tr>
                                                </xsl:for-each>
                                            </tbody>
                                        </xsl:when>
                                    </xsl:choose>
                                </xsl:for-each>
                            </table>
                        </td>
                    </tr>
                
                    <tr>
                        <td colspan="2" align="left" valign="top">
                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                <tr>
                                    <xsl:for-each select="PANELBODY/FIELD/FIELD[@type='RadioButtonList' and (@id='RBexpressedemotion')]">
                                        <xsl:if test="boolean(LISTITEMS/LISTITEM/@Selected = 'true')">
                                            <td width="20%" align="left" valign="top" class="small-left-heading">
                                                <xsl:value-of select="@label" /> 
                                                <span class="colon"> : </span>
                                            </td>
                                            <td width="30%" align="left" valign="top">
                                                <xsl:for-each select="LISTITEMS/LISTITEM">
                                                    <xsl:if test="@Selected = 'true'">
                                                        <xsl:value-of select="current()"></xsl:value-of>
                                                    </xsl:if>
                                                </xsl:for-each>
                                                <xsl:if test="FIELD">
                                                    <span>
                                                        <xsl:attribute name="id">
                                                            <xsl:value-of select="@Backdivid"></xsl:value-of>
                                                        </xsl:attribute>
                                                        <xsl:attribute name="class">
                                                            <xsl:value-of select="@Backcontrols"></xsl:value-of>
                                                        </xsl:attribute>
                                                        <xsl:for-each select="FIELD">
                                                            <xsl:choose>
                                                                <xsl:when test="@type='RadioButtonList'">
                                                                    <br/>
                                                                    <xsl:value-of select="@label" />&#160;
                                                                    <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                        <xsl:if test="@Selected = 'true'">
                                                                            <span id="sub_textbox">
                                                                                <xsl:value-of select="current()"></xsl:value-of>
                                                                            </span>
                                                                        </xsl:if>
                                                                    </xsl:for-each>
                                                                </xsl:when>
                                                            </xsl:choose>
                                                        </xsl:for-each>
                                                    </span>
                                                </xsl:if>
                                            </td>
                                        </xsl:if>
                                    </xsl:for-each>
                                </tr>
                                <tr>
                                    <td>
                                        <span id='hide_span'>Hiding text</span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                
                    <xsl:for-each select="PANELBODY/FIELD/FIELD[@type='TextArea' and @id='history_family']">
                        <xsl:if test="VALUE and VALUE!=''">
                            <tr>
                                <td align="left" valign="top" class="notes">
                                    <strong>
                                        Notes: 
                                    </strong>
                                    <xsl:call-template name="LFsToBRs">
                                        <xsl:with-param name="input" select="VALUE"/>
                                    </xsl:call-template>
                                </td>
                            </tr>
                        </xsl:if>
                    </xsl:for-each>
                
                    <xsl:for-each select="PANELBODY/FIELD[@type='PanelBar' and @label='Personal History']">
                        <tr class="PanelBar">
                            <td align="left" valign="top" class="ribbon" style="color:#FFFFFF;">
                                <h1 style="font-family:Arial, Helvetica, sans-serif;">   
                                    <xsl:value-of select="@label" />  
                                </h1>
                            </td>
                        </tr>
                    </xsl:for-each>
                
                    <tr class='personal_history'>
                        <td>
                            <tr>
                                <td colspan="2" align="left" valign="top">
                                    <table width="100%" border="0" cellspacing="0" cellpadding="0" class="print-friendly">
                                        <xsl:for-each select="PANELBODY/FIELD/FIELD[@type='PanelBar' and @label='Birth and Development']">
                                            <tr>
                                                <td align="left" valign="top" class="ribbon">
                                                    <h2 style="font-family:Arial, Helvetica, sans-serif;">   
                                                        <xsl:value-of select="@label" />  
                                                    </h2>
                                                </td>
                                            </tr>
                                        </xsl:for-each>
                
                                        <tr>
                                            <td align="left" valign="top">
                                                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                                    <tr>
                                                        <xsl:for-each select="PANELBODY/FIELD/FIELD/FIELD[((@type='RadioButtonList') or (@type='CheckBoxList')) and ((@id='RBpbprenatal') or (@id='RBpbperinatal') or (@id='RBpbperinatal2') 
                                                or (@id='RBpbmajorillness') or (@id='RBpbimmunizationschedule') or (@id='RBpbdevelopmentmilestone') or (@id='RBpbmajorillnessduringchild') or (@id='CBpbemotionalbehaviour')
                                                or (@id='RBpbhomeatmosphere') or (@id='CBpbemotionalbehaviouradole') or (@id='RBpbhomeatmosphereadole') or (@id='RBpbparentallack'))]">
                                                            <xsl:choose>
                                                                <xsl:when test="@type='RadioButtonList'">
                                                                    <xsl:if test="boolean(LISTITEMS/LISTITEM/@Selected = 'true')">
                                                                        <td width="25%" align="left" valign="top" class="small-left-heading">
                                                                            <xsl:value-of select="@label" />
                                                                            <span class="colon"> : </span>
                                                                        </td>
                                                                        <td  width="25%" align="left" valign="top">
                                                                            <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                                <xsl:if test="@Selected = 'true'">
                                                                                    <xsl:value-of select="current()"></xsl:value-of>
                                                                                </xsl:if>
                                                                            </xsl:for-each>
                                                                            <xsl:if test="FIELD">
                                                                                <span>
                                                                                    <xsl:attribute name="id">
                                                                                        <xsl:value-of select="@Backdivid"></xsl:value-of>
                                                                                    </xsl:attribute>
                                                                                    <xsl:attribute name="class">
                                                                                        <xsl:value-of select="@Backcontrols"></xsl:value-of>
                                                                                    </xsl:attribute>
                                                                                    <xsl:for-each select="FIELD">
                                                                                        <xsl:choose>
                                                                                            <xsl:when test="@type='TextBox'"> [
                                                                                                <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                                                    <xsl:if test="@name='value'">
                                                                                                        <span id="sub_textbox">
                                                                                                            <xsl:value-of select="current()"></xsl:value-of>
                                                                                                        </span>
                                                                                                    </xsl:if>
                                                                                                </xsl:for-each> ]
                                                                                            </xsl:when>
                                                                    
                                                                                            <xsl:when test="@type='CheckBoxList'"> [
                                                                                                <xsl:if test="boolean(LISTITEMS/LISTITEM/@Selected = 'true')">
                                                                                                    <xsl:for-each select="LISTITEMS/LISTITEM[@Selected = 'true']">
                                                                                                        <xsl:value-of select="concat(' ' , @value)" />
                                                                                                        <xsl:if test="not(position() = last())">,</xsl:if>
                                                                                                    </xsl:for-each>
                                                                                                </xsl:if> ] 
                                                                                            </xsl:when>
                                                                                        </xsl:choose>
                                                                                    </xsl:for-each>
                                                                                </span>
                                                                            </xsl:if>
                                                                        </td>
                                                                    </xsl:if>
                                                                </xsl:when>
                                                                <xsl:when test="@type='CheckBoxList'">
                                                                    <xsl:if test="boolean(LISTITEMS/LISTITEM/@Selected = 'true')">
                                                                        <td width="25%" align="left" valign="top" class="small-left-heading">
                                                                            <xsl:value-of select="@label" /> 
                                                                            <span class="colon"> : </span>
                                                                        </td>
                                                                        <td width="25%" align="left" valign="top">
                                                                            <xsl:for-each select="LISTITEMS/LISTITEM[@Selected = 'true']">
                                                                                <xsl:value-of select="concat(' ' , @value)" />
                                                                                <xsl:if test="not(position() = last())">,</xsl:if>
                                                                            </xsl:for-each>
                                                                            <xsl:if test="FIELD">
                                                                                <span>
                                                                                    <xsl:attribute name="id">
                                                                                        <xsl:value-of select="@Backdivid"></xsl:value-of>
                                                                                    </xsl:attribute>
                                                                                    <xsl:attribute name="class">
                                                                                        <xsl:value-of select="@Backcontrols"></xsl:value-of>
                                                                                    </xsl:attribute>
                                                                                    <xsl:for-each select="FIELD">
                                                                                        <xsl:choose>
                                                                                            <xsl:when test="@type='TextBox'">
                                                                                                <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                                                    <xsl:if test="@name='value'">
                                                                                                        <span id="sub_textbox">
                                                                                                            [ <xsl:value-of select="current()"></xsl:value-of> ]
                                                                                                        </span>
                                                                                                    </xsl:if>
                                                                                                </xsl:for-each>
                                                                                            </xsl:when>
                                                                                        </xsl:choose>
                                                                                    </xsl:for-each>
                                                                                </span>
                                                                            </xsl:if>
                                                                        </td>
                                                                    </xsl:if>
                                                                    <xsl:variable name="i" select="position() mod 2 = 1"/>
                                                                    <xsl:if test="$i=false">
                                                                        <tr> </tr> 
                                                                    </xsl:if>
                                                                </xsl:when>
                                                            </xsl:choose>
                                                            <xsl:variable name="i" select="position() mod 2 = 1"/>
                                                            <xsl:if test="$i=false">
                                                                <tr> </tr> 
                                                            </xsl:if>
                                                        </xsl:for-each>
                                                    </tr>
                                                    <tr>
                                                        <td>
                                                            <span id='hide_span'>Hiding text</span>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                
                            <xsl:for-each select="PANELBODY/FIELD/FIELD/FIELD[@type='TextArea' and @id='birthdevelopmentnotes']">
                                <xsl:if test="VALUE and VALUE!=''">
                                    <tr>
                                        <td colspan="4" align="left" valign="top" class="notes">
                                            <strong> Notes : </strong>
                                            <xsl:call-template name="LFsToBRs">
                                                <xsl:with-param name="input" select="VALUE"/>
                                            </xsl:call-template>
                                        </td>
                                    </tr>
                                </xsl:if>
                            </xsl:for-each>
                            
                            <tr>
                                <td colspan="2" align="left" valign="top">
                                    <table width="100%" border="0" cellspacing="0" cellpadding="0" class="print-friendly">
                                        <xsl:for-each select="PANELBODY/FIELD/FIELD[@type='PanelBar' and @label='Education History']">
                                            <tr>
                                                <td align="left" valign="top" class="ribbon">
                                                    <h2 style="font-family:Arial, Helvetica, sans-serif;">   
                                                        <xsl:value-of select="@label" />  
                                                    </h2>
                                                </td>
                                            </tr>
                                        </xsl:for-each>
                
                                        <tr>
                                            <td align="left" valign="top">
                                                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                                    <tr>
                                                        <xsl:for-each select="PANELBODY/FIELD/FIELD/FIELD[(@type='RadioButtonList') and ((@id='RBpbbreakstudy') or (@id='RBpbfrechangeschool') or (@id='RBpbtypeofschool') 
                                                or (@id='RBpbmedium') or (@id='RBpbacademicperfor') or (@id='RBpbteacherrelation') or (@id='RBpbstudentrelation'))]">
                                                            <xsl:if test="boolean(LISTITEMS/LISTITEM/@Selected = 'true')">
                                                                <td width="25%" align="left" valign="top" class="small-left-heading">
                                                                    <xsl:value-of select="@label" />
                                                                    <span class="colon"> : </span>
                                                                </td>
                                                                <td  width="25%" align="left" valign="top">
                                                                    <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                        <xsl:if test="@Selected = 'true'">
                                                                            <xsl:value-of select="current()"></xsl:value-of>
                                                                        </xsl:if>
                                                                    </xsl:for-each>
                                                                    <xsl:if test="FIELD">
                                                                        <span>
                                                                            <xsl:attribute name="id">
                                                                                <xsl:value-of select="@Backdivid"></xsl:value-of>
                                                                            </xsl:attribute>
                                                                            <xsl:attribute name="class">
                                                                                <xsl:value-of select="@Backcontrols"></xsl:value-of>
                                                                            </xsl:attribute>
                                                                            <xsl:for-each select="FIELD">
                                                                                <xsl:choose>
                                                                                    <xsl:when test="@type='TextBox'"> [
                                                                                        <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                                            <xsl:if test="@name='value'">
                                                                                                <span id="sub_textbox">
                                                                                                    <xsl:value-of select="current()"></xsl:value-of>
                                                                                                </span>
                                                                                            </xsl:if>
                                                                                        </xsl:for-each> ]
                                                                                    </xsl:when>
                                                                    
                                                                                    <xsl:when test="@type='CheckBoxList'"> 
                                                                                        <xsl:if test="boolean(LISTITEMS/LISTITEM/@Selected = 'true')"> [
                                                                                            <xsl:for-each select="LISTITEMS/LISTITEM[@Selected = 'true']">
                                                                                                <xsl:value-of select="concat(' ' , @value)" />
                                                                                                <xsl:if test="not(position() = last())">,</xsl:if>
                                                                                            </xsl:for-each> ]
                                                                                        </xsl:if> 
                                                                                    </xsl:when>
                                                                                </xsl:choose>
                                                                            </xsl:for-each>
                                                                        </span>
                                                                    </xsl:if>
                                                                </td>
                                                            </xsl:if>
                                                            <xsl:variable name="i" select="position() mod 2 = 1"/>
                                                            <xsl:if test="$i=false">
                                                                <tr> </tr> 
                                                            </xsl:if>
                                                        </xsl:for-each>
                                                    </tr>
                                                    <tr>
                                                        <td>
                                                            <span id='hide_span'>Hiding text</span>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                

                
                
                            <xsl:for-each select="PANELBODY/FIELD/FIELD/FIELD[@type='TextArea' and @id='educational_history_notes']">
                                <xsl:if test="VALUE and VALUE!=''">
                                    <tr>
                                        <td colspan="4" align="left" valign="top" class="notes">
                                            <strong> Notes : </strong>
                                            <xsl:call-template name="LFsToBRs">
                                                <xsl:with-param name="input" select="VALUE"/>
                                            </xsl:call-template>
                                        </td>
                                    </tr>
                                </xsl:if>
                            </xsl:for-each>
                
                            <tr>
                                <td colspan="2" align="left" valign="top">
                                    <table width="100%" border="0" cellspacing="0" cellpadding="0" class="print-friendly">
                                        <xsl:for-each select="PANELBODY/FIELD/FIELD[@type='PanelBar' and @label='Occupational History']">
                                            <tr>
                                                <td align="left" valign="top" class="ribbon">
                                                    <h2 style="font-family:Arial, Helvetica, sans-serif;">   
                                                        <xsl:value-of select="@label" />  
                                                    </h2>
                                                </td>
                                            </tr>
                                        </xsl:for-each>
                
                                        <tr>
                                            <td align="left" valign="top">
                                                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                                    <tr>
                                                        <xsl:for-each select="PANELBODY/FIELD/FIELD/FIELD[((@type='DropDownList') or (@type='RadioButtonList')) and ((@id='DDLstartedworking') or (@id='RBpbworkrecord') or (@id='RBfreqchangeofjob') or (@id='RBRegularitysss'))]">
                                                            <xsl:choose>
                                                                <xsl:when test="@type='DropDownList'">
                                                                    <xsl:if test="boolean(LISTITEMS/LISTITEM/@Selected = 'true')">
                                                                        <td width="25%" align="left" valign="top" class="small-left-heading">
                                                                            <xsl:value-of select="@label" />
                                                                            <span class="colon"> : </span>
                                                                        </td>
                                                                        <td width="25%" align="left" valign="top">
                                                                            <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                                <xsl:if test="@Selected = 'true'">
                                                                                    <xsl:value-of select="@value"></xsl:value-of>
                                                                                </xsl:if> 
                                                                            </xsl:for-each> Years
                                                                        </td>
                                                                        <xsl:variable name="i" select="position() mod 2 = 1"/>
                                                                        <xsl:if test="$i=false">
                                                                            <tr> </tr> 
                                                                        </xsl:if>
                                                                    </xsl:if>
                                                                </xsl:when>
                                                                <xsl:when test="@type='RadioButtonList'">
                                                                    <xsl:if test="boolean(LISTITEMS/LISTITEM/@Selected = 'true')">
                                                                        <td width="27%" align="left" valign="top" class="small-left-heading">
                                                                            <xsl:value-of select="@label" />
                                                                            <span class="colon"> : </span>
                                                                        </td>
                                                                        <td  width="23%" align="left" valign="top">
                                                                            <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                                <xsl:if test="@Selected = 'true'">
                                                                                    <xsl:value-of select="current()"></xsl:value-of>
                                                                                </xsl:if>
                                                                            </xsl:for-each>
                                                                            <xsl:if test="FIELD">
                                                                                <span>
                                                                                    <xsl:attribute name="id">
                                                                                        <xsl:value-of select="@Backdivid"></xsl:value-of>
                                                                                    </xsl:attribute>
                                                                                    <xsl:attribute name="class">
                                                                                        <xsl:value-of select="@Backcontrols"></xsl:value-of>
                                                                                    </xsl:attribute>
                                                                                    <xsl:for-each select="FIELD">
                                                                                        <xsl:choose>
                                                                                            <xsl:when test="@type='TextBox'">
                                                                                                <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                                                    <xsl:if test="@name='value'"> [
                                                                                                        <span id="sub_textbox">
                                                                                                            <xsl:value-of select="current()"></xsl:value-of>
                                                                                                        </span> ]
                                                                                                    </xsl:if>
                                                                                                </xsl:for-each>
                                                                                            </xsl:when>
                                                                    
                                                                                            <xsl:when test="@type='CheckBoxList'"> 
                                                                                                <xsl:if test="boolean(LISTITEMS/LISTITEM/@Selected = 'true')"> [
                                                                                                    <xsl:for-each select="LISTITEMS/LISTITEM[@Selected = 'true']">
                                                                                                        <xsl:value-of select="concat(' ' , @value)" />
                                                                                                        <xsl:if test="not(position() = last())">,</xsl:if>
                                                                                                    </xsl:for-each> ]
                                                                                                </xsl:if>
                                                                                            </xsl:when>
                                                                                        </xsl:choose>
                                                                                    </xsl:for-each>
                                                                                </span>
                                                                            </xsl:if>
                                                                        </td>
                                                                    </xsl:if>
                                                                    <xsl:variable name="i" select="position() mod 2 = 1"/>
                                                                    <xsl:if test="$i=false">
                                                                        <tr> </tr> 
                                                                    </xsl:if>
                                                                </xsl:when>
                                        
                                                            </xsl:choose>
                                                        </xsl:for-each>
                                                    </tr>
                                                    <tr>
                                                        <td>
                                                            <span id='hide_span'>Hiding text</span>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                
                            <xsl:for-each select="PANELBODY/FIELD/FIELD/FIELD[@type='TextArea' and @id='occupational_history_notes']">
                                <xsl:if test="VALUE and VALUE!=''">
                                    <tr>
                                        <td colspan="4" align="left" valign="top" class="notes">
                                            <strong> Notes : </strong>
                                            <xsl:call-template name="LFsToBRs">
                                                <xsl:with-param name="input" select="VALUE"/>
                                            </xsl:call-template>
                                        </td>
                                    </tr>
                                </xsl:if>
                            </xsl:for-each>
                
                            <tr>
                                <td colspan="2" align="left" valign="top">
                                    <table width="100%" border="0" cellspacing="0" cellpadding="0" class="print-friendly">
                                        <xsl:for-each select="PANELBODY/FIELD/FIELD[@type='PanelBar' and @label='Menstrual History']">
                                            <tr>
                                                <td align="left" valign="top" class="ribbon">
                                                    <h2 style="font-family:Arial, Helvetica, sans-serif;">   
                                                        <xsl:value-of select="@label" />  
                                                    </h2>
                                                </td>
                                            </tr>
                                        </xsl:for-each>
                
                                        <tr>
                                            <td align="left" valign="top">
                                                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                                    <tr>
                                                        <xsl:for-each select="PANELBODY/FIELD/FIELD/FIELD[((@type='TextBox')or (@type='RadioButtonList')) and ((@id='txtMenarche') or (@id='txtLMP') or (@id='txtMenopause') or (@id='RBRegularity'))]">
                                                            <xsl:choose>
                                                                <xsl:when test="@type='TextBox'">
                                                                    <xsl:if test="PROPERTIES/PROPERTY[@name = 'value' and string(.)]">
                                                                        <td width="25%" align="left" valign="top" class="small-left-heading">
                                                                            <xsl:value-of select="@label" />
                                                                            <span class="colon"> : </span>
                                                                        </td>
                                                                        <td width="25%" align="left" valign="top">
                                                                            <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                                <xsl:if test="@name='value'">
                                                                                    <xsl:value-of select="current()"></xsl:value-of>
                                                                                    <xsl:value-of select="../../@Backtext"></xsl:value-of>
                                                                                </xsl:if>
                                                                            </xsl:for-each>
                                                                        </td>
                                                                    </xsl:if>
                                                                    <xsl:variable name="i" select="position() mod 2 = 1"/>
                                                                    <xsl:if test="$i=false">
                                                                        <tr> </tr> 
                                                                    </xsl:if>
                                                                </xsl:when>
                                                                <xsl:when test="@type='RadioButtonList'">
                                                                    <xsl:if test="boolean(LISTITEMS/LISTITEM/@Selected = 'true')">
                                                                        <td width="25%" align="left" valign="top" class="small-left-heading">
                                                                            <xsl:value-of select="@label" /> 
                                                                            <span class="colon"> : </span>
                                                                        </td>
                                                                        <td width="25%" align="left" valign="top">
                                                                            <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                                <xsl:if test="@Selected = 'true'">
                                                                                    <xsl:value-of select="current()"></xsl:value-of>
                                                                                </xsl:if>
                                                                            </xsl:for-each>
                                                                        </td>
                                                                    </xsl:if>
                                                                    <xsl:variable name="i" select="position() mod 2 = 1"/>
                                                                    <xsl:if test="$i=false">
                                                                        <tr> </tr> 
                                                                    </xsl:if>
                                                                </xsl:when>
                                                            </xsl:choose>
                                                        </xsl:for-each>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            
                            <tr>
                                <td colspan="2" align="left" valign="top">
                                    <table width="100%" border="0" cellspacing="0" cellpadding="0" class="print-friendly">
                                        <xsl:for-each select="PANELBODY/FIELD/FIELD[@type='PanelBar' and @label='Marital History']">
                                            <tr>
                                                <td align="left" valign="top" class="ribbon">
                                                    <h2 style="font-family:Arial, Helvetica, sans-serif;">   
                                                        <xsl:value-of select="@label" />  
                                                    </h2>
                                                </td>
                                            </tr>
                                        </xsl:for-each>
                
                                        <tr>
                                            <td align="left" valign="top">
                                                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                                    <tr>
                                                        <xsl:for-each select="PANELBODY/FIELD/FIELD/FIELD[(@type='TextBoxDDL') and ((@id='txtDurationofMarriage') or (@id='txtAgeofMarriage'))]">
                                                            <xsl:if test="PROPERTIES/PROPERTY[@name = 'value' and string(.)]">
                                                                <td width="25%" align="left" valign="top" class="small-left-heading">
                                                                    <xsl:value-of select="@label" />
                                                                    <span class="colon"> : </span>
                                                                </td>
                                                                <td width="25%" align="left" valign="top">
                                                                    <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                        <xsl:if test="@name='value'">
                                                                            <xsl:value-of select="current()"></xsl:value-of>
                                                                        </xsl:if>
                                                                    </xsl:for-each>
                                             &#160;
                                                                    <xsl:for-each select="FIELD/LISTITEMS/LISTITEM">
                                                                        <xsl:if test="@Selected = 'true'">
                                                                        &#160;
                                                                            <xsl:value-of select="@value"></xsl:value-of>
                                                                        </xsl:if>
                                                                    </xsl:for-each>
                                                                </td>
                                                            </xsl:if>
                                                        </xsl:for-each>
                                                    </tr>
                                                    <tr>
                                                        <xsl:for-each select="PANELBODY/FIELD/FIELD/FIELD[(@type='RadioButtonList') and ((@id='RBtype') or (@id='RBmaritalsexualsatisfac') or (@id='RBhistoryof') or (@id='RBknowledgeofspouse'))]">
                                                            <xsl:if test="boolean(LISTITEMS/LISTITEM/@Selected = 'true')">
                                                                <td width="25%" align="left" valign="top" class="small-left-heading">
                                                                    <xsl:value-of select="@label" /> 
                                                                    <span class="colon"> : </span>
                                                                </td>
                                                                <td width="25%" align="left" valign="top">
                                                                    <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                        <xsl:if test="@Selected = 'true'">
                                                                            <xsl:value-of select="current()"></xsl:value-of>
                                                                        </xsl:if>
                                                                    </xsl:for-each>
                                                                </td>
                                                            </xsl:if>
                                                            <xsl:variable name="i" select="position() mod 2 = 1"/>
                                                            <xsl:if test="$i=false">
                                                                <tr> </tr> 
                                                            </xsl:if>
                                                        </xsl:for-each>
                                                    </tr>
                                                    <tr>
                                                        <td>
                                                            <span id='hide_span'>Hiding text</span>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            
                            <tr>
                                <td colspan="2" align="left" valign="top">
                                    <table width="100%" border="0" cellspacing="0" cellpadding="0" class="print-friendly">
                                        <xsl:for-each select="PANELBODY/FIELD/FIELD[@type='PanelBar' and @label='Sexual History']">
                                            <tr>
                                                <td align="left" valign="top" class="ribbon">
                                                    <h2 style="font-family:Arial, Helvetica, sans-serif;">   
                                                        <xsl:value-of select="@label" />  
                                                    </h2>
                                                </td>
                                            </tr>
                                        </xsl:for-each>
                
                                        <tr>
                                            <td align="left" valign="top">
                                                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                                    <tr>
                                                        <xsl:for-each select="PANELBODY/FIELD/FIELD/FIELD[((@type='RadioButtonList') or (@type='CheckBoxList')) and ((@id='RBorientationSexual') or (@id='CBsexualfunctioning') or (@id='CBparaphilias'))]">
                                                            <xsl:choose>
                                                                <xsl:when test="@type='RadioButtonList'">
                                                                    <xsl:if test="boolean(LISTITEMS/LISTITEM/@Selected = 'true')">
                                                                        <td width="25%" align="left" valign="top" class="small-left-heading">
                                                                            <xsl:value-of select="@label" /> 
                                                                            <span class="colon"> : </span>
                                                                        </td>
                                                                        <td width="25%" align="left" valign="top">
                                                                            <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                                <xsl:if test="@Selected = 'true'">
                                                                                    <xsl:value-of select="current()"></xsl:value-of>
                                                                                </xsl:if>
                                                                            </xsl:for-each>
                                                                        </td>
                                                                    </xsl:if>
                                                                    <xsl:variable name="i" select="position() mod 2 = 1"/>
                                                                    <xsl:if test="$i=false">
                                                                        <tr> </tr> 
                                                                    </xsl:if>
                                                                </xsl:when>
                                                                <xsl:when test="@type='CheckBoxList'">
                                                                    <xsl:if test="boolean(LISTITEMS/LISTITEM/@Selected = 'true')">
                                                                        <td width="25%" align="left" valign="top" class="small-left-heading">
                                                                            <xsl:value-of select="@label" /> 
                                                                            <span class="colon"> : </span>
                                                                        </td>
                                                                        <td width="25%" align="left" valign="top">
                                                                            <xsl:for-each select="LISTITEMS/LISTITEM[@Selected = 'true']">
                                                                                <xsl:value-of select="concat(' ' , @value)" />
                                                                                <xsl:if test="not(position() = last())">,</xsl:if>
                                                                            </xsl:for-each>
                                                                            <xsl:if test="FIELD">
                                                                                <span>
                                                                                    <xsl:attribute name="id">
                                                                                        <xsl:value-of select="@Backdivid"></xsl:value-of>
                                                                                    </xsl:attribute>
                                                                                    <xsl:attribute name="class">
                                                                                        <xsl:value-of select="@Backcontrols"></xsl:value-of>
                                                                                    </xsl:attribute>
                                                                                    <xsl:for-each select="FIELD">
                                                                                        <xsl:choose>
                                                                                            <xsl:when test="@type='TextBox'">
                                                                                                [<xsl:value-of select="@label" />&#160;
                                                                                                <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                                                    <xsl:if test="@name='value'">
                                                                                                        <span id="sub_textbox">
                                                                                                            <xsl:value-of select="current()"></xsl:value-of>
                                                                                                        </span>
                                                                                                    </xsl:if>
                                                                                                </xsl:for-each> ]
                                                                                            </xsl:when>
                                                                                        </xsl:choose>
                                                                                    </xsl:for-each>
                                                                                </span>
                                                                            </xsl:if>
                                                                        </td>
                                                                    </xsl:if>
                                                                    <xsl:variable name="i" select="position() mod 2 = 1"/>
                                                                    <xsl:if test="$i=false">
                                                                        <tr> </tr> 
                                                                    </xsl:if>
                                                                </xsl:when>
                                                            </xsl:choose>
                                                        </xsl:for-each>
                                                    </tr>
                                                    <tr>
                                                        <td>
                                                            <span id='hide_span'>Hiding text</span>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                
                            <xsl:for-each select="PANELBODY/FIELD/FIELD/FIELD[@type='TextArea' and @id='sexual_history_notes']">
                                <xsl:if test="VALUE and VALUE!=''">
                                    <tr>
                                        <td colspan="4" align="left" valign="top" class="notes">
                                            <strong> Notes : </strong>
                                            <xsl:call-template name="LFsToBRs">
                                                <xsl:with-param name="input" select="VALUE"/>
                                            </xsl:call-template>
                                        </td>
                                    </tr>
                                </xsl:if>
                            </xsl:for-each>

                            <tr>
                                <td colspan="2" align="left" valign="top">
                                    <table width="100%" border="0" cellspacing="0" cellpadding="0" class="print-friendly">
                                        <xsl:for-each select="PANELBODY/FIELD/FIELD[@type='PanelBar' and @label='Substance History']">
                                            <tr>
                                                <td align="left" valign="top" class="ribbon">
                                                    <h2 style="font-family:Arial, Helvetica, sans-serif;">   
                                                        <xsl:value-of select="@label" />  
                                                    </h2>
                                                </td>
                                            </tr>
                                        </xsl:for-each>
                
                                        <tr class="sub">
                                            <td align="left" valign="top" class="table2 table4">
                                                <table width="100%" border="0" cellspacing="0" cellpadding="0" >
                                                    <xsl:for-each select="PANELBODY/FIELD/FIELD/FIELD[@type='RadGrid' and @ADDButtonID='RGSubsadd']">
                                                        <xsl:for-each select="PROPERTIES/PROPERTY">
                                                            <xsl:attribute name="{@name}">
                                                                <xsl:value-of select="current()"></xsl:value-of>
                                                            </xsl:attribute>
                                                        </xsl:for-each>
                                                        <thead>
                                                            <tr class="RadGrid">
                                                                <xsl:for-each select="HEADER/TH">
                                                                    <td class="inner-table-heading">
                                                                        <strong>
                                                                            <xsl:value-of select="current()" />
                                                                        </strong>
                                                                    </td>
                                                                </xsl:for-each>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            <xsl:for-each select="COLUMNS">
                                                                <tr>
                                                                    <xsl:for-each select="FIELD">
                                                                        <td>
                                                                            <xsl:choose>
                                                                                <!-- Main Text Box With DropDownList-->
                                                                                <xsl:when test="@type='TextBoxDDL'">
                                                                                    <xsl:if test="PROPERTIES/PROPERTY[@name = 'value' and string(.)]">
                                                                                        <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                                            <xsl:if test="@name='value'">
                                                                                                <xsl:value-of select="current()"></xsl:value-of>
                                                                                            </xsl:if>
                                                                                            <xsl:value-of select="@Backtext"></xsl:value-of>
                                                                                        </xsl:for-each>
                                                                                    &#160;
                                                                                        <xsl:for-each select="FIELD/LISTITEMS/LISTITEM">
                                                                                            <xsl:if test="@Selected = 'true'">
                                                                                            &#160;
                                                                                                <xsl:value-of select="@value"></xsl:value-of>
                                                                                            </xsl:if>
                                                                                        </xsl:for-each>
                                                                                    </xsl:if>
                                                                                </xsl:when>
                                                                    
                                                                                <xsl:when test="@type='DropDownList'">
                                                                                    <xsl:if test="boolean(LISTITEMS/LISTITEM/@Selected = 'true')">
                                                                                        <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                                            <xsl:if test="@Selected = 'true'">
                                                                                                            &#160;
                                                                                                <xsl:value-of select="@value"></xsl:value-of>
                                                                                            </xsl:if>
                                                                                        </xsl:for-each>
                                                                                    </xsl:if>
                                                                                </xsl:when>
                                                                                <xsl:when test="@type='DropDowntextbox'">
                                                                                    <xsl:if test="boolean(LISTITEMS/LISTITEM/@Selected = 'true')">
                                                                                        <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                                            <xsl:if test="@Selected = 'true'">
                                                                                                <xsl:value-of select="current()"></xsl:value-of>
                                                                                            </xsl:if>
                                                                                        </xsl:for-each>
                                                                                        <xsl:if test="FIELD">
                                                                                            <span class="reason">
                                                                                                <xsl:attribute name="id">
                                                                                                    <xsl:value-of select="@Backdivid"></xsl:value-of>
                                                                                                </xsl:attribute>
                                                                                                <xsl:attribute name="class">
                                                                                                    <xsl:value-of select="@Backcontrols"></xsl:value-of>
                                                                                                </xsl:attribute>
                                                                                                <xsl:for-each select="FIELD">
                                                                                                    <xsl:choose>
                                                                                                        <xsl:when test="@type='TextBox'">
                                                                                                            <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                                                                <xsl:if test="@name='value'">
                                                                                                                    [  <xsl:value-of select="current()"></xsl:value-of> ]
                                                                                                                </xsl:if>
                                                                                                            </xsl:for-each>
                                                                                                        </xsl:when>
                                                                            
                                                                                                    </xsl:choose>
                                                                                                </xsl:for-each>
                                                                                            </span>
                                                                                        </xsl:if>
                                                                                    </xsl:if>
                                                                                </xsl:when>
                                                                                <xsl:when test="@type='RadioButtonList'">
                                                                                    <xsl:if test="boolean(LISTITEMS/LISTITEM/@Selected = 'true')">
                                                                                        <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                                            <xsl:if test="@Selected = 'true'">
                                                                                                <xsl:value-of select="current()"></xsl:value-of>
                                                                                            </xsl:if>
                                                                                        </xsl:for-each>
                                                                                        <xsl:if test="FIELD">
                                                                                            <span class="reason">
                                                                                                <xsl:attribute name="id">
                                                                                                    <xsl:value-of select="@Backdivid"></xsl:value-of>
                                                                                                </xsl:attribute>
                                                                                                <xsl:attribute name="class">
                                                                                                    <xsl:value-of select="@Backcontrols"></xsl:value-of>
                                                                                                </xsl:attribute>
                                                                                                <xsl:for-each select="FIELD">
                                                                                                    <xsl:choose>
                                                                                                        <xsl:when test="@type='TextBox'">
                                                                                                            [ <xsl:value-of select="@label" />&#160;
                                                                                                            <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                                                                <xsl:if test="@name='value'">
                                                                                                                    <xsl:value-of select="current()"></xsl:value-of> ]
                                                                                                                </xsl:if>
                                                                                                            </xsl:for-each>
                                                                                                        </xsl:when>
                                                                            
                                                                                                    </xsl:choose>
                                                                                                </xsl:for-each>
                                                                                            </span>
                                                                                        </xsl:if>
                                                                                    </xsl:if>
                                                                                </xsl:when>
                                                                                <xsl:when test="@type='CheckBoxList'">
                                                                                    <xsl:if test="boolean(LISTITEMS/LISTITEM/@Selected = 'true')">
                                                                                        <xsl:for-each select="LISTITEMS/LISTITEM[@Selected = 'true']">
                                                                                            <xsl:value-of select="concat(' ' , @value)" />
                                                                                            <xsl:if test="not(position() = last())">,</xsl:if>
                                                                                        </xsl:for-each>
                                                                                    </xsl:if>
                                                                                </xsl:when>
                                                                            </xsl:choose>
                                                                        </td>
                                                                    </xsl:for-each>
                                                                </tr>
                                                            </xsl:for-each>
                                                        </tbody>
                                                    </xsl:for-each>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>    


                            <xsl:for-each select="PANELBODY/FIELD/FIELD/FIELD[@type='TextArea' and @id='substance_history_notes']">
                                <xsl:if test="VALUE and VALUE!=''">
                                    <tr>
                                        <td colspan="4" align="left" valign="top" class="notes">
                                            <strong> Notes : </strong>
                                            <xsl:call-template name="LFsToBRs">
                                                <xsl:with-param name="input" select="VALUE"/>
                                            </xsl:call-template>
                                        </td>
                                    </tr>
                                </xsl:if>
                            </xsl:for-each>
                            
                            <tr>
                                <td colspan="2" align="left" valign="top">
                                    <table width="100%" border="0" cellspacing="0" cellpadding="0" class="print-friendly">
                                        <xsl:for-each select="PANELBODY/FIELD/FIELD[@type='PanelBar' and @label='Premorbid Personality']">
                                            <tr>
                                                <td align="left" valign="top" class="ribbon">
                                                    <h2 style="font-family:Arial, Helvetica, sans-serif;">   
                                                        <xsl:value-of select="@label" />  
                                                    </h2>
                                                </td>
                                            </tr>
                                        </xsl:for-each>
                                        <tr>
                                            <td align="left" valign="top">
                                                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                                    <tr>
                                                        <xsl:for-each select="PANELBODY/FIELD/FIELD/FIELD[@type='CheckBoxList' and ( (@id='CBattitudetoself') or (@id='CBattitudetowork') or (@id='CBmoralreligiousattitude') or (@id='CBsocialrelationships')
                    or (@id='CBmood') or (@id='CBleisuretimespent') or (@id='CBfantasies'))]">
                                                            <xsl:if test="boolean(LISTITEMS/LISTITEM/@Selected = 'true')">
                                                                <td width="25%" align="left" valign="top" class="small-left-heading">
                                                                    <xsl:value-of select="@label" /> 
                                                                    <span class="colon"> : </span>
                                                                </td>
                                                                <td width="25%" align="left" valign="top">
                                                                    <xsl:for-each select="LISTITEMS/LISTITEM[@Selected = 'true']">
                                                                        <xsl:value-of select="concat(' ' , @value)" />
                                                                        <xsl:if test="not(position() = last())">,</xsl:if>
                                                                    </xsl:for-each>
                                                                </td>
                                                                <xsl:variable name="i" select="position() mod 2 = 1"/>
                                                                <xsl:if test="$i=false">
                                                                    <tr> </tr> 
                                                                </xsl:if>
                                                            </xsl:if>
                                                        </xsl:for-each>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>

                
                            <xsl:for-each select="PANELBODY/FIELD/FIELD/FIELD[@type='TextArea' and @id='premorbid_personality_notes']">
                                <xsl:if test="VALUE and VALUE!=''">
                                    <tr>
                                        <td colspan="4" align="left" valign="top" class="notes">
                                            <strong> Notes : </strong>
                                            <xsl:call-template name="LFsToBRs">
                                                <xsl:with-param name="input" select="VALUE"/>
                                            </xsl:call-template>
                                        </td>
                                    </tr>
                                </xsl:if>
                            </xsl:for-each>
                        </td>
                    </tr>
                                
                    <!-- Mental status examination head -->
                    <xsl:for-each select="PANELBODY/FIELD[@type='PanelBar' and @label='Mental Status Examination']">
                        <tr class="mental_status_examination_head">
                            <td align="left" valign="top" class="ribbon" style="color:#FFFFFF;">
                                <h1 style="font-family:Arial, Helvetica, sans-serif;">
                                    <xsl:value-of select="@label" />
                                </h1>
                            </td>
                        </tr>
                    </xsl:for-each>
                    
                    <tr class='mental_status'> 
                        <td>
                            <tr class="mental_status_examination">
                                <td colspan="2" align="left" valign="top">
                                    <table width="100%" border="0" cellspacing="0" cellpadding="0" class="print-friendly">
                                        <!-- General appearance behaviour head-->
                                        <xsl:for-each select="PANELBODY/FIELD/FIELD[@type='Header2' and @class='General_Appearance_Behaviour']">
                                            <tr>
                                                <td align="left" valign="top" class="ribbon">
                                                    <h2 style="font-family:Arial, Helvetica, sans-serif;">
                                                        <xsl:value-of select="@label" />
                                                    </h2>
                                                </td>
                                            </tr>
                                        </xsl:for-each>
                
                                        <!-- General appearance behaviour head details-->
                                        <tr>
                                            <td align="left" valign="top">
                                                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                                    <tr>
                                                        <xsl:for-each select="PANELBODY/FIELD/FIELD[((@type='RadioButtonList') or (@type='CheckBoxList')) and ((@id='RBAppearance') or (@id='RBlevelofgrooming') or (@id='RBlevelofcleanliness') or (@id='RBmodeofentry') or
                                            (@id='RBCooperativeness') or (@id='RBeyetoeyecontact') or (@id='RBHallucinatorybehaviour') or (@id='RBrapport') or (@id='RBgaitdisurbances') or (@id='CBGesturingposturing') or (@id='CBPsychomotorActivity'))]">
                                                            <xsl:choose>
                                                                <xsl:when test="@type='RadioButtonList'">
                                                                    <xsl:if test="boolean(LISTITEMS/LISTITEM/@Selected = 'true')">
                                                                        <td width="25%" align="left" valign="top" class="small-left-heading">
                                                                            <xsl:value-of select="@label" /> 
                                                                            <span class="colon"> : </span>
                                                                        </td>
                                                                        <td width="25%" align="left" valign="top">
                                                                            <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                                <xsl:if test="@Selected = 'true'">
                                                                                    <xsl:value-of select="current()"></xsl:value-of>
                                                                                </xsl:if>
                                                                            </xsl:for-each>
                                                                        </td>
                                                                    </xsl:if>
                                                                    <xsl:variable name="i" select="position() mod 2 = 1"/>
                                                                    <xsl:if test="$i=false">
                                                                        <tr> </tr> 
                                                                    </xsl:if>
                                                                </xsl:when>
                                                                <xsl:when test="@type='CheckBoxList'">
                                                                    <xsl:if test="boolean(LISTITEMS/LISTITEM/@Selected = 'true')">
                                                                        <tr>
                                                                            <td width="30%" align="left" valign="top" class="small-left-heading">
                                                                                <xsl:value-of select="@label" /> 
                                                                                <span class="colon"> : </span>
                                                                            </td>
                                                                            <td colspan="3" width="70%" align="left" valign="top">
                                                                                <xsl:for-each select="LISTITEMS/LISTITEM[@Selected = 'true']">
                                                                                    <xsl:value-of select="concat(' ' , @value)" />
                                                                                    <xsl:if test="not(position() = last())">,</xsl:if>
                                                                                </xsl:for-each>
                                                                                <xsl:if test="FIELD">
                                                                                    <span>
                                                                                        <xsl:attribute name="id">
                                                                                            <xsl:value-of select="@Backdivid"></xsl:value-of>
                                                                                        </xsl:attribute>
                                                                                        <xsl:attribute name="class">
                                                                                            <xsl:value-of select="@Backcontrols"></xsl:value-of>
                                                                                        </xsl:attribute>
                                                                                        <xsl:for-each select="FIELD">
                                                                                            <xsl:choose>
                                                                                                <xsl:when test="@type='TextBox'">
                                                                                                    [<xsl:value-of select="@label" />&#160;
                                                                                                    <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                                                        <xsl:if test="@name='value'">
                                                                                                            <span id="sub_textbox">
                                                                                                                <xsl:value-of select="current()"></xsl:value-of>
                                                                                                            </span>
                                                                                                        </xsl:if>
                                                                                                    </xsl:for-each> ]
                                                                                                </xsl:when>
                                                                                            </xsl:choose>
                                                                                        </xsl:for-each>
                                                                                    </span>
                                                                                </xsl:if>
                                                                            </td>
                                                                        </tr>
                                                                    </xsl:if>
                                                                </xsl:when>
                                                            </xsl:choose>
                                                        </xsl:for-each>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            
                            <tr class="mental_status_examination">
                                <td colspan="2" align="left" valign="top">
                                    <table width="100%" border="0" cellspacing="0" cellpadding="0" class="print-friendly">
                                        <!-- Speech head-->
                                        <xsl:for-each select="PANELBODY/FIELD/FIELD[@type='Header2' and @label='Speech']">
                                            <tr>
                                                <td align="left" valign="top" class="ribbon">
                                                    <h2 style="font-family:Arial, Helvetica, sans-serif;">
                                                        <xsl:value-of select="@label" />
                                                    </h2>
                                                </td>
                                            </tr>
                                        </xsl:for-each>
                
                                        <tr>
                                            <td align="left" valign="top">
                                                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                                    <tr>
                                                        <xsl:for-each select="PANELBODY/FIELD/FIELD[((@type='RadioButtonList') or (@type='TextBox')) and ((@id='RBReactiontime') or (@id='RBtempo') or (@id='RBvolume') or
                                                                                (@id='RBtone') or (@id='RBCoherence') or (@id='RBRelevance') or (@id='txtspeechsample'))]">
                                                            <xsl:choose>
                                                                <xsl:when test="@type='RadioButtonList'">
                                                                    <xsl:if test="boolean(LISTITEMS/LISTITEM/@Selected = 'true')">
                                                                        <td width="25%" align="left" valign="top" class="small-left-heading">
                                                                            <xsl:value-of select="@label" /> 
                                                                            <span class="colon"> : </span>
                                                                        </td>
                                                                        <td width="25%" align="left" valign="top">
                                                                            <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                                <xsl:if test="@Selected = 'true'">
                                                                                    <xsl:value-of select="current()"></xsl:value-of>
                                                                                </xsl:if>
                                                                            </xsl:for-each>
                                                                        </td>
                                                                    </xsl:if>
                                                                    <xsl:variable name="i" select="position() mod 2 = 1"/>
                                                                    <xsl:if test="$i=false">
                                                                        <tr> </tr> 
                                                                    </xsl:if>
                                                                </xsl:when>
                                                                <xsl:when test="@type='TextBox'">
                                                                    <xsl:if test="PROPERTIES/PROPERTY[@name = 'value' and string(.)]">
                                                                        <tr>
                                                                            <td align="left" valign="top" class="small-left-heading">
                                                                                <xsl:value-of select="@label" /> 
                                                                                <span class="colon"> : </span>
                                                                            </td>
                                                                            <td align="left" valign="top">
                                                                                <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                                    <xsl:if test="@name='value'">
                                                                                        <xsl:value-of select="current()"></xsl:value-of>
                                                                                        <xsl:value-of select="../../@Backtext"></xsl:value-of>
                                                                                    </xsl:if>
                                                                                </xsl:for-each>
                                                                            </td>
                                                                        </tr>
                                                                    </xsl:if>
                                                                </xsl:when>
                                                            </xsl:choose>
                                                        </xsl:for-each>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>

                            <tr class="mental_status_examination">
                                <td colspan="2" align="left" valign="top">
                                    <table width="100%" border="0" cellspacing="0" cellpadding="0" class="print-friendly">
                                        <!-- Thought head-->
                                        <xsl:for-each select="PANELBODY/FIELD/FIELD[@type='Header2' and @label='Thought']">
                                            <tr>
                                                <td align="left" valign="top" class="ribbon">
                                                    <h2 style="font-family:Arial, Helvetica, sans-serif;">
                                                        <xsl:value-of select="@label" />
                                                    </h2>
                                                </td>
                                            </tr>
                                        </xsl:for-each>
                
                                        <xsl:for-each select="PANELBODY/FIELD/FIELD[@type='CheckBoxList' and @id='CBstreamform']">
                                            <xsl:if test="boolean(LISTITEMS/LISTITEM/@Selected = 'true')">
                                                <tr>
                                                    <td align="left" valign="top" class="ribbon">
                                                        <h3 style="font-family:Arial, Helvetica, sans-serif;">
                                                            <xsl:value-of select="@label" />
                                                        </h3>
                                                    </td>
                                                </tr>
                        
                                                <tr>
                                                    <td align="left" valign="top" style="padding-left: 10px;">
                                                        <xsl:for-each select="LISTITEMS/LISTITEM[@Selected = 'true']">
                                                            <xsl:value-of select="concat(' ' , @value)" />
                                                            <xsl:if test="not(position() = last())">,</xsl:if>
                                                        </xsl:for-each>
                                                    </td>
                                                </tr>
                                            </xsl:if>
                                        </xsl:for-each>
                                    </table>
                                </td>
                            </tr>

                            <tr class="mental_status_examination">
                                <td colspan="2" align="left" valign="top">
                                    <table width="100%" border="0" cellspacing="0" cellpadding="0" class="print-friendly">
                                        <xsl:for-each select="PANELBODY/FIELD/FIELD[@type='Header2' and @label='Possession of thought']">
                                            <tr>
                                                <td align="left" valign="top" class="ribbon">
                                                    <h3 style="font-family:Arial, Helvetica, sans-serif;">
                                                        <xsl:value-of select="@label" />
                                                    </h3>
                                                </td>
                                            </tr>
                                        </xsl:for-each>
                
                                        <tr>
                                            <td align="left" valign="top">
                                                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                                    <tr>
                                                        <xsl:for-each select="PANELBODY/FIELD/FIELD[((@type='CheckBoxList') or (@type='TextArea')) and ((@id='CBnatureofcompulsion') or (@id='possession_of_thought_notes'))]">
                                                            <xsl:choose>
                                                                <xsl:when test="@type='CheckBoxList'">
                                                                    <xsl:if test="boolean(LISTITEMS/LISTITEM/@Selected = 'true')">
                                                                        <td width="15%" align="left" valign="top" class="small-left-heading">
                                                                            <xsl:value-of select="@label" /> 
                                                                            <span class="colon"> : </span>
                                                                        </td>
                                                                        <td width="30%" align="left" valign="top">
                                                                            <xsl:for-each select="LISTITEMS/LISTITEM[@Selected = 'true']">
                                                                                <xsl:value-of select="concat(' ' , @value)" />
                                                                                <xsl:if test="not(position() = last())">,</xsl:if>
                                                                            </xsl:for-each>
                                                                        </td>
                                                                    </xsl:if>
                                                                </xsl:when>
                
                                                                <xsl:when test="@type='TextArea'">
                                                                    <xsl:if test="VALUE and VALUE!=''">
                                                                        <td width="15%" align="left" valign="top" class="small-left-heading">
                                                                            <xsl:value-of select="@label"/> 
                                                                            <span class="colon"> : </span>
                                                                        </td>
                                                                        <td width="30%" align="left" valign="top">
                                                                            <xsl:call-template name="LFsToBRs">
                                                                                <xsl:with-param name="input" select="VALUE"/>
                                                                            </xsl:call-template>
                                                                        </td>
                                                                    </xsl:if>
                                                                </xsl:when>
                                                            </xsl:choose>
                                
                                                        </xsl:for-each>
                                 
                                                    </tr>
                                                    <tr>
                                                        <td>
                                                            <span id='hide_span'>Hiding text</span>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <xsl:for-each select="PANELBODY/FIELD/FIELD[@type='RadioButtonList' and @id='RBObsession']">
                                                            <xsl:if test="boolean(LISTITEMS/LISTITEM/@Selected = 'true')">
                                                                <tr>
                                                                    <td width="30%" align="left" valign="top" class="small-left-heading">
                                                                        <xsl:value-of select="@label" />
                                                                        <span class="colon"> : </span>
                                                                    </td>
                                                                    <td colspan="2">
                                                                        <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                            <xsl:if test="@Selected = 'true'">
                                                                                <xsl:value-of select="current()"></xsl:value-of>
                                                                            </xsl:if>
                                                                        </xsl:for-each>
                                                                        <xsl:if test="FIELD">
                                                                            <span>
                                                                                <xsl:attribute name="id">
                                                                                    <xsl:value-of select="@Backdivid"></xsl:value-of>
                                                                                </xsl:attribute>
                                                                                <xsl:attribute name="class">
                                                                                    <xsl:value-of select="@Backcontrols"></xsl:value-of>
                                                                                </xsl:attribute>
                                                                                <xsl:for-each select="FIELD">
                                                                                    <xsl:choose>
                                                                                        <xsl:when test="@type='RadioButtonList'">
                                                                                            [ <xsl:value-of select="@label" />&#160;
                                                                                            <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                                                <xsl:if test="@Selected = 'true'">
                                                                                                    <span id="sub_textbox">
                                                                                                        <xsl:value-of select="current()"></xsl:value-of>
                                                                                                    </span>
                                                                                                </xsl:if>
                                                                                            </xsl:for-each> ]
                                                                                        </xsl:when>
                                                                                    </xsl:choose>
                                                                                </xsl:for-each>
                                                                            </span>
                                                                        </xsl:if>
                                                                    </td>
                                                                </tr>
                                                            </xsl:if>
                                                        </xsl:for-each>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            
                            <tr class="mental_status_examination">
                                <td colspan="2" align="left" valign="top">
                                    <table width="100%" border="0" cellspacing="0" cellpadding="0" class="print-friendly">
                                        <xsl:for-each select="PANELBODY/FIELD/FIELD[@type='Header2' and @label='Thought Content']">
                                            <tr>
                                                <td align="left" valign="top" class="ribbon">
                                                    <h3 style="font-family:Arial, Helvetica, sans-serif;">
                                                        <xsl:value-of select="@label" />
                                                    </h3>
                                                </td>
                                            </tr>
                                        </xsl:for-each>
                
                                        <tr>
                                            <td align="left" valign="top">
                                                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                                    <tr>
                                                        <xsl:for-each select="PANELBODY/FIELD/FIELD[((@type='CheckBoxList') or (@type='TextBox')) and ((@id='txtcontentofthought') or (@id='CBDelusions') or (@id='CBIdeas'))]">
                                                            <xsl:choose>
                                                                <xsl:when test="@type='CheckBoxList'">
                                                                    <xsl:if test="boolean(LISTITEMS/LISTITEM/@Selected = 'true')">
                                                                        <td width="22%" align="left" valign="top" class="small-left-heading">
                                                                            <xsl:value-of select="@label" />
                                                                            <span class="colon"> : </span>
                                                                        </td>
                                                                        <td width="28%" align="left" valign="top">
                                                                            <xsl:for-each select="LISTITEMS/LISTITEM[@Selected = 'true']">
                                                                                <xsl:value-of select="concat(' ' , @value)" />
                                                                                <xsl:if test="not(position() = last())">,</xsl:if>
                                                                            </xsl:for-each>
                                                                            <xsl:if test="FIELD">
                                                                                <span>
                                                                                    <xsl:attribute name="id">
                                                                                        <xsl:value-of select="@Backdivid"></xsl:value-of>
                                                                                    </xsl:attribute>
                                                                                    <xsl:attribute name="class">
                                                                                        <xsl:value-of select="@Backcontrols"></xsl:value-of>
                                                                                    </xsl:attribute>
                                                                                    <xsl:for-each select="FIELD">
                                                                                        <xsl:choose>
                                                                                            <xsl:when test="@type='RadioButtonList'">
                                                                                                <xsl:if test="boolean(LISTITEMS/LISTITEM/@Selected = 'true')">
                                                                                                    <span> |
                                                                                                        <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                                                            <xsl:if test="@Selected = 'true'">
                                                                                                                <xsl:value-of select="current()"></xsl:value-of>
                                                                                                            </xsl:if>
                                                                                                        </xsl:for-each>
                                                                                                    </span>
                                                                                                </xsl:if>
                                                                                            </xsl:when>
                                                                                        </xsl:choose>
                                                                                    </xsl:for-each>
                                                                                </span>
                                                                            </xsl:if>
                                                                        </td>
                                                                    </xsl:if>
                                                                    <xsl:variable name="i" select="position() mod 2 = 1"/>
                                                                    <xsl:if test="$i=false">
                                                                        <tr> </tr> 
                                                                    </xsl:if>
                                                                </xsl:when>
                                        
                                                                <xsl:when test="@type='TextBox'">
                                                                    <xsl:if test="PROPERTIES/PROPERTY[@name = 'value' and string(.)]">
                                                                        <td width="20%" align="left" valign="top" class="small-left-heading">
                                                                            <xsl:value-of select="@label" /> 
                                                                            <span class="colon"> : </span>
                                                                        </td>
                                                                        <td width="30%" align="left" valign="top">
                                                                            <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                                <xsl:if test="@name='value'">
                                                                                    <xsl:value-of select="current()"></xsl:value-of>
                                                                                    <xsl:value-of select="../../@Backtext"></xsl:value-of>
                                                                                </xsl:if>
                                                                            </xsl:for-each>
                                                                        </td>
                                                                    </xsl:if>
                                                                </xsl:when>
                                        
                                                            </xsl:choose>
                                                        </xsl:for-each>
                                                    </tr>
                                                    <tr>
                                                        <td>
                                                            <span id='hide_span'>Hiding text</span>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            
                            <tr class="mental_status_examination">
                                <td colspan="2" align="left" valign="top">
                                    <table width="100%" border="0" cellspacing="0" cellpadding="0" class="print-friendly">
                                        <xsl:for-each select="PANELBODY/FIELD/FIELD[@type='Header2' and @label='Mood']">
                                            <tr>
                                                <td align="left" valign="top" class="ribbon">
                                                    <h2 style="font-family:Arial, Helvetica, sans-serif;">
                                                        <xsl:value-of select="@label" />
                                                    </h2>
                                                </td>
                                            </tr>
                                        </xsl:for-each>
                
                                        <tr>
                                            <td align="left" valign="top">
                                                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                                    <tr>
                                                        <xsl:for-each select="PANELBODY/FIELD/FIELD[((@type='CheckBoxList') or (@type='RadioButtonList')) and ((@id='RBQuality') or (@id='RBrangeandreactivity'))]">
                                                            <xsl:choose>
                                                                <xsl:when test="@type='RadioButtonList'">
                                                                    <xsl:if test="boolean(LISTITEMS/LISTITEM/@Selected = 'true')">
                                                                        <td width="200" align="left" valign="top" class="small-left-heading">
                                                                            <xsl:value-of select="@label" /> 
                                                                            <span class="colon"> : </span>
                                                                        </td>
                                                                        <td align="left" valign="top">
                                                                            <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                                <xsl:if test="@Selected = 'true'">
                                                                                    <xsl:value-of select="current()"></xsl:value-of>
                                                                                </xsl:if>
                                                                            </xsl:for-each>
                                                                        </td>
                                                                    </xsl:if>
                                                                </xsl:when>
                                                                <xsl:when test="@type='CheckBoxList'">
                                                                    <xsl:if test="boolean(LISTITEMS/LISTITEM/@Selected = 'true')">
                                                                        <td width="200" align="left" valign="top" class="small-left-heading">
                                                                            <xsl:value-of select="@label" /> 
                                                                            <span class="colon"> : </span>
                                                                        </td>
                                                                        <td align="left" valign="top">
                                                                            <xsl:for-each select="LISTITEMS/LISTITEM[@Selected = 'true']">
                                                                                <xsl:value-of select="concat(' ' , @value)" />
                                                                                <xsl:if test="not(position() = last())">,</xsl:if>
                                                                            </xsl:for-each>
                                                                        </td>
                                                                    </xsl:if>
                                                                </xsl:when>
                                                            </xsl:choose>
                                                        </xsl:for-each>
                                                    </tr>
                                                    <tr>
                                                        <td>
                                                            <span id='hide_span'>Hiding text</span>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            
                            <tr class="mental_status_examination">
                                <td colspan="2" align="left" valign="top">
                                    <table width="100%" border="0" cellspacing="0" cellpadding="0" class="print-friendly">
                                        <xsl:for-each select="PANELBODY/FIELD/FIELD[@type='Header2' and @label='Affect']">
                                            <tr>
                                                <td align="left" valign="top" class="ribbon">
                                                    <h3 style="font-family:Arial, Helvetica, sans-serif;">
                                                        <xsl:value-of select="@label" />
                                                    </h3>
                                                </td>
                                            </tr>
                                        </xsl:for-each>
                
                                        <tr>
                                            <td align="left" valign="top">
                                                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                                    <tr>
                                                        <xsl:for-each select="PANELBODY/FIELD/FIELD[((@type='TextBox') or (@type='TextArea')) and ((@id='txtSubjectively') or (@id='txtObjectively') or (@id='mood_notes'))]">
                                                            <xsl:choose>
                                                                <xsl:when test="@type='TextBox'">
                                                                    <xsl:if test="PROPERTIES/PROPERTY[@name = 'value' and string(.)]">
                                                                        <td width="12%" align="left" valign="top" class="small-left-heading">
                                                                            <xsl:value-of select="@label" />
                                                                            <span class="colon"> : </span>
                                                                        </td>
                                                                        <td width="26%" align="left" valign="top">
                                                                            <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                                <xsl:if test="@name='value'">
                                                                                    <xsl:value-of select="current()"></xsl:value-of>
                                                                                    <xsl:value-of select="../../@Backtext"></xsl:value-of>
                                                                                </xsl:if>
                                                                            </xsl:for-each>
                                                                        </td>
                                                                    </xsl:if>
                                                                </xsl:when>
                                                                <xsl:when test="@type='TextArea'">
                                                                    <xsl:if test="VALUE and VALUE!=''">
                                                                        <tr>
                                                                            <td colspan="4" align="left" valign="middle" class="notes">
                                                                                <strong>
                                                                                    <xsl:value-of select="@label" />
                                                                                </strong>
                                                                                <xsl:call-template name="LFsToBRs">
                                                                                    <xsl:with-param name="input" select="VALUE"/>
                                                                                </xsl:call-template>
                                                                            </td>
                                                                        </tr>
                                                                    </xsl:if>
                                                                </xsl:when>
                                                            </xsl:choose>
                                                        </xsl:for-each>
                                                    </tr>
                                                    <tr>
                                                        <td>
                                                            <span id='hide_span'>Hiding text</span>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>

                            <tr class="mental_status_examination">
                                <td colspan="2" align="left" valign="top">
                                    <table width="100%" border="0" cellspacing="0" cellpadding="0" class="print-friendly">
                                        <xsl:for-each select="PANELBODY/FIELD/FIELD[@type='Header2' and @label='Perception']">
                                            <tr>
                                                <td align="left" valign="top" class="ribbon">
                                                    <h2 style="font-family:Arial, Helvetica, sans-serif;">
                                                        <xsl:value-of select="@label" />
                                                    </h2>
                                                </td>
                                            </tr>
                                        </xsl:for-each>
                
                                        <tr>
                                            <td align="left" valign="top">
                                                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                                    <tr>
                                                        <xsl:for-each select="PANELBODY/FIELD/FIELD[((@type='CheckBoxList') or (@type='TextArea')) and ((@id='CBAuditoryhallucination') or (@id='CBtype') or (@id='CBOtherHallucinations') or (@id='CBIllusion') or (@id='Perception_notes'))]">
                                                            <xsl:choose>
                                                                <xsl:when test="@type='CheckBoxList'">
                                                                    <xsl:if test="boolean(LISTITEMS/LISTITEM/@Selected = 'true')">
                                                                        <td width="25%" align="left" valign="top" class="small-left-heading">
                                                                            <xsl:value-of select="@label" /> 
                                                                            <span class="colon"> : </span>
                                                                        </td>
                                                                        <td  width="25%" align="left" valign="top">
                                                                            <xsl:for-each select="LISTITEMS/LISTITEM[@Selected = 'true']">
                                                                                <xsl:value-of select="concat(' ' , @value)" />
                                                                                <xsl:if test="not(position() = last())">,</xsl:if>
                                                                            </xsl:for-each>
                                                                        </td>
                                                                    </xsl:if>
                                                                    <xsl:variable name="i" select="position() mod 2 = 1"/>
                                                                    <xsl:if test="$i=false">
                                                                        <tr> </tr> 
                                                                    </xsl:if>
                                                                </xsl:when>
                                                                <xsl:when test="@type='TextArea'">
                                                                    <xsl:if test="VALUE and VALUE!=''">
                                                                        <td width="25%" align="left" valign="top" class="small-left-heading">
                                                                            <xsl:value-of select="@label" /> 
                                                                            <span class="colon"> : </span>
                                                                        </td>
                                                                        <td width="25%" align="left" valign="top">
                                                                            <xsl:call-template name="LFsToBRs">
                                                                                <xsl:with-param name="input" select="VALUE"/>
                                                                            </xsl:call-template>
                                                                        </td>
                                                                    </xsl:if>
                                                                </xsl:when>
                                        
                                                            </xsl:choose>
                                                        </xsl:for-each>
                                                    </tr>
                                                    <tr>
                                                        <td>
                                                            <span id='hide_span'>Hiding text</span>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>

                            <tr class="mental_status_examination">
                                <td colspan="2" align="left" valign="top">
                                    <table width="100%" border="0" cellspacing="0" cellpadding="0" class="print-friendly">
                                        <xsl:for-each select="PANELBODY/FIELD/FIELD[@type='Header2' and @label='Higher Mental Functions']">
                                            <tr>
                                                <td align="left" valign="top" class="ribbon">
                                                    <h2 style="font-family:Arial, Helvetica, sans-serif;">
                                                        <xsl:value-of select="@label" />
                                                    </h2>
                                                </td>
                                            </tr>
                                        </xsl:for-each>
               
                                        <tr>
                                            <td align="left" valign="top">
                                                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                                    <tr>
                                                        <xsl:for-each select="PANELBODY/FIELD/FIELD[((@type='RadioButtonList') or (@type='DropDownList') or (@type='TextArea') or (@type='CheckBoxList')) and ((@id='RBAttension') or (@id='RBConcentration') 
                                                    or (@id='RBOrientation') or (@id='RBMemory') or (@id='RBIntelligence') or (@id='RBAbstraction') or (@id='DDLInsight') or (@id='RBMemory') or (@id='RBMemoryRecent') or (@id='RBMemoryRemote')
                                                    or (@id='RBJudgement') or (@id='RBJudgementsocial') or (@id='RBJudgementtest') or (@id='RBKnowledgeaboutmentalillness') or (@id='RBAttitudeillness') or (@id='higher_mental_notes'))]">
                                                            <xsl:choose>
                                                                <xsl:when test="@type='RadioButtonList'">
                                                                    <xsl:if test="boolean(LISTITEMS/LISTITEM/@Selected = 'true')">
                                                                        <td width="22%" align="left" valign="top" class="small-left-heading">
                                                                            <xsl:value-of select="@label" /> 
                                                                            <span class="colon"> : </span>
                                                                        </td>
                                                                        <td width="28%" align="left" valign="top">
                                                                            <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                                <xsl:if test="@Selected = 'true'">
                                                                                    <xsl:value-of select="current()"></xsl:value-of>
                                                                                </xsl:if>
                                                                            </xsl:for-each>
                                                                            <xsl:if test="FIELD">
                                                                                <span>
                                                                                    <xsl:attribute name="id">
                                                                                        <xsl:value-of select="@Backdivid"></xsl:value-of>
                                                                                    </xsl:attribute>
                                                                                    <xsl:attribute name="class">
                                                                                        <xsl:value-of select="@Backcontrols"></xsl:value-of>
                                                                                    </xsl:attribute>
                                                                                    <xsl:for-each select="FIELD">
                                                                                        <xsl:choose>
                                                                                            <xsl:when test="@type='CheckBoxList'">
                                                                                                <xsl:if test="boolean(LISTITEMS/LISTITEM/@Selected = 'true')"> [
                                                                                                    <xsl:for-each select="LISTITEMS/LISTITEM[@Selected = 'true']">
                                                                                                        <xsl:value-of select="concat(' ' , @value)" />
                                                                                                        <xsl:if test="not(position() = last())">,</xsl:if>
                                                                                                    </xsl:for-each> ]
                                                                                                </xsl:if>
                                                                                            </xsl:when>
                                                                                            <xsl:when test="@type='RadioButtonList'">
                                                                                                <span>
                                                                                                    | <xsl:value-of select="@label" />
                                                                                                    <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                                                        <xsl:if test="@Selected = 'true'">
                                                                                                            <xsl:value-of select="current()"></xsl:value-of>
                                                                                                        </xsl:if>
                                                                                                    </xsl:for-each>
                                                                                                </span>
                                                                                            </xsl:when>
                                                                                        </xsl:choose>
                                                                                    </xsl:for-each>
                                                                                </span>
                                                                            </xsl:if>
                                                                        </td>
                                                                        <xsl:variable name="i" select="position() mod 2 = 1"/>
                                                                        <xsl:if test="$i=false">
                                                                            <tr> </tr> 
                                                                        </xsl:if>
                                                                    </xsl:if>
                                                                </xsl:when>
                                                                <xsl:when test="@type='DropDownList'">
                                                                    <xsl:if test="boolean(LISTITEMS/LISTITEM/@Selected = 'true')">
                                                                        <td width="22%" align="left" valign="top" class="small-left-heading">
                                                                            <xsl:value-of select="@label" />
                                                                            <span class="colon"> : </span>
                                                                        </td>
                                                                        <td width="28%" align="left" valign="top">
                                                                            <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                                <xsl:if test="@Selected = 'true'">
                                                                                    <xsl:value-of select="@value"></xsl:value-of>
                                                                                </xsl:if>
                                                                            </xsl:for-each>
                                                                        </td>
                                                                        <xsl:variable name="i" select="position() mod 2 = 1"/>    
                                                                        <xsl:if test="$i=false">
                                                                            <tr> </tr> 
                                                                        </xsl:if>
                                                                    </xsl:if>
                                                                </xsl:when>
                                                                <xsl:when test="@type='CheckBoxList'">
                                                                    <xsl:if test="boolean(LISTITEMS/LISTITEM/@Selected = 'true')">
                                                                        <td width="22%" align="left" valign="top" class="small-left-heading">
                                                                            <xsl:if test="((@id ='RBMemory') or (@id ='RBMemoryRecent') or (@id ='RBMemoryRemote'))">
                                                                                Memory <span class="colon"> : </span>
                                                                            </xsl:if>
                                                                            <xsl:if test="((@id ='RBJudgement') or (@id ='RBJudgementsocial') or (@id ='RBJudgementtest'))">
                                                                                Judgement <span class="colon"> : </span>
                                                                            </xsl:if>
                                                                
                                                                        </td>
                                                                        <td width="28%" align="left" valign="top">
                                                                            <xsl:for-each select="LISTITEMS/LISTITEM[@Selected = 'true']">
                                                                                <xsl:value-of select="concat(' ' , @value)" />
                                                                                <xsl:if test="not(position() = last())">,</xsl:if>
                                                                            </xsl:for-each>
                                                                            <xsl:if test="FIELD">
                                                                                <span>
                                                                                    <xsl:attribute name="id">
                                                                                        <xsl:value-of select="@Backdivid"></xsl:value-of>
                                                                                    </xsl:attribute>
                                                                                    <xsl:attribute name="class">
                                                                                        <xsl:value-of select="@Backcontrols"></xsl:value-of>
                                                                                    </xsl:attribute>
                                                                                    <xsl:for-each select="FIELD">
                                                                                        <xsl:choose>
                                                                                            <xsl:when test="@type='RadioButtonList'">
                                                                                                <xsl:if test="boolean(LISTITEMS/LISTITEM/@Selected = 'true')">
                                                                                                    <span> |
                                                                                                        <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                                                            <xsl:if test="@Selected = 'true'">
                                                                                                                <xsl:value-of select="current()"></xsl:value-of>
                                                                                                            </xsl:if>
                                                                                                        </xsl:for-each>
                                                                                                    </span>
                                                                                                </xsl:if>
                                                                                            </xsl:when>
                                                                                        </xsl:choose>
                                                                                    </xsl:for-each>
                                                                                </span>
                                                                            </xsl:if>
                                                                        </td>
                                                                    </xsl:if>
                                                                    <xsl:variable name="i" select="position() mod 2 = 1"/>
                                                                    <xsl:if test="$i=false">
                                                                        <tr> </tr> 
                                                                    </xsl:if>
                                                                </xsl:when>
                                        
                                                                <xsl:when test="@type='TextArea'">
                                                                    <xsl:if test="VALUE and VALUE!=''">
                                                                        <tr>
                                                                            <td colspan="4" align="left" valign="top" class="notes">
                                                                                <strong>
                                                                                    <xsl:value-of select="@label"/> : </strong>
                                                                                <xsl:call-template name="LFsToBRs">
                                                                                    <xsl:with-param name="input" select="VALUE"/>
                                                                                </xsl:call-template>
                                                                            </td>
                                                                        </tr>
                                                                    </xsl:if>
                                                                </xsl:when>
                                                    
                                                            </xsl:choose>
                                                        </xsl:for-each>
                                                    </tr>
                                                    <tr>
                                                        <td>
                                                            <span id='hide_span'>Hiding text</span>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>

                                    </table>
                                </td>
                            </tr>
                        </td>
                    </tr>
                    
                    <tr class='icd10'>
                        <td align="left" valign="top">
                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                <tr>
                                    <xsl:for-each select="PANELBODY/FIELD[(@type='TextBox') and (@id='txtDiagnosis')]">
                                        <xsl:if test="PROPERTIES/PROPERTY[@name = 'value' and string(.)]">
                                            <tr>
                                                <td width="20%" align="left" valign="top" class="small-left-heading">
                                                    <xsl:value-of select="@label"/>
                                                </td>
                                                <td width="300" align="left" valign="top">
                                                    <xsl:for-each select="PROPERTIES/PROPERTY">
                                                        <xsl:if test="@name='value'">
                                                            <xsl:value-of select="current()"/>
                                                            <xsl:value-of select="../../@Backtext"/>
                                                        </xsl:if>
                                                    </xsl:for-each>
                                                </td>
                                            </tr>
                                        </xsl:if>
                                    </xsl:for-each>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <tr>
                        <td colspan="2" align="left" valign="top">
                            <table width="100%" border="0" cellspacing="0" cellpadding="0" class="print-friendly">
                                <xsl:for-each select="PANELBODY/FIELD[@type='Header2' and @label='DSM -IV TR']">
                                    <tr>
                                        <td align="left" valign="top" class="ribbon" style="color:#ffffff;">
                                            <h1 style="font-family:Arial, Helvetica, sans-serif;">
                                                <xsl:value-of select="@label" />
                                            </h1>
                                        </td>
                                    </tr>
                                </xsl:for-each>
                
                                <tr>
                                    <td align="left" valign="top">
                                        <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                            <tr>
                                                <xsl:for-each select="PANELBODY/FIELD[(@type='TextBox') and ((@id='txtAxis1') or (@id='txtAxis2') or (@id='txtAxis3') or (@id='txtAxis4') or (@id='txtAxis5'))]">
                                                    <xsl:choose>
                                                        <xsl:when test="@type='TextBox'">
                                                            <xsl:if test="PROPERTIES/PROPERTY[@name = 'value' and string(.)]">
                                                                <tr>
                                                                    <td width="20%" align="left" valign="top" class="small-left-heading">
                                                                        <xsl:value-of select="@label" /> 
                                                                        <span class="colon"> : </span>
                                                                    </td>
                                                                    <td width="300" align="left" valign="top">
                                                                        <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                            <xsl:if test="@name='value'">
                                                                                <xsl:value-of select="current()"></xsl:value-of>
                                                                                <xsl:value-of select="../../@Backtext"></xsl:value-of>
                                                                            </xsl:if>
                                                                        </xsl:for-each>
                                                                    </td>
                                                                </tr>
                                                            </xsl:if>
                                                        </xsl:when>
                                                    </xsl:choose>
                                                </xsl:for-each>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>     
                            </table>
                        </td>
                    </tr>
                

                </tbody>
            </table>
        </xsl:for-each>
        <table width="100%" border="0" cellspacing="0" cellpadding="0">
            <tr>
                <xsl:for-each select="FIELDS/GROUP/PANELBODY/FIELD[(@type='TextArea') and (@id='diagnosis_notes')]">
                    <xsl:choose>
                        <xsl:when test="@type='TextBox'">
                            <xsl:if test="PROPERTIES/PROPERTY[@name = 'value' and string(.)]">
                                <tr>
                                    <td width="20%" align="left" valign="top" class="small-left-heading">
                                        <xsl:value-of select="@label" /> 
                                        <span class="colon"> : </span>
                                    </td>
                                    <td width="300" align="left" valign="top">
                                        <xsl:for-each select="PROPERTIES/PROPERTY">
                                            <xsl:if test="@name='value'">
                                                <xsl:value-of select="current()"></xsl:value-of>
                                                <xsl:value-of select="../../@Backtext"></xsl:value-of>
                                            </xsl:if>
                                        </xsl:for-each>
                                    </td>
                                </tr>
                            </xsl:if>
                        </xsl:when>
                        <xsl:when test="@type='TextArea'">
                            <xsl:if test="VALUE and VALUE!=''">
                                <tr>
                                    <td colspan="4" align="left" valign="top" class="notes">
                                        <strong>Comments : </strong>
                                        <xsl:call-template name="LFsToBRs">
                                            <xsl:with-param name="input" select="VALUE"/>
                                        </xsl:call-template>
                                    </td>
                                </tr>
                            </xsl:if>
                        </xsl:when>
                    </xsl:choose>
                </xsl:for-each>
            </tr>
        </table>
    </xsl:template>

    <!--Used all label-->
    <xsl:template match = "@label">
        <td width="37%" align="left" valign="top" class="small-left-heading">
            <xsl:value-of select="." /> 
            <span class="colon"> : </span>
        </td>
    </xsl:template>
    
    <xsl:template name="LFsToBRs">
        <xsl:param name="input" />
        <xsl:choose>
            <xsl:when test="contains($input, '&#10;')">
                <xsl:value-of select="substring-before($input, '&#10;')" />
                <br />
                <xsl:call-template name="LFsToBRs">
                    <xsl:with-param name="input" select="substring-after($input, '&#10;')" />
                </xsl:call-template>
            </xsl:when>
            <xsl:otherwise>
                <xsl:value-of select="$input" />
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>
    
    
    
</xsl:stylesheet>