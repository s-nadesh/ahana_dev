<?php

namespace common\models;

use yii\db\ActiveQuery;

/**
 * This is the model class for table "gl_internal_code".
 *
 * @property integer $internal_code_id
 * @property integer $org_id
 * @property string $code_type
 * @property string $code_prefix
 * @property integer $code
 * @property integer $code_padding
 * @property string $code_suffix
 * @property string $status
 * @property string $created_at
 * @property integer $created_by
 * @property string $modified_at
 * @property integer $modified_by
 * @property string $deleted_at
 *
 * @property CoOrganization $org
 */
class GlInternalCode extends GActiveRecord {

    /**
     * @inheritdoc
     */
    public static function tableName() {
        return 'gl_internal_code';
    }

    /**
     * @inheritdoc
     */
    public function rules() {
        return [
            [['org_id', 'code_prefix', 'code'], 'required'],
            [['org_id', 'code', 'code_padding', 'created_by', 'modified_by'], 'integer'],
            [['status'], 'string'],
            [['created_at', 'modified_at', 'deleted_at'], 'safe'],
            [['code_type'], 'string', 'max' => 2],
            [['code_prefix', 'code_suffix'], 'string', 'max' => 10],
            [['org_id', 'code_type'], 'unique', 'targetAttribute' => ['org_id', 'code_type'], 'message' => 'The combination of Org ID and Code Type has already been taken.'],
            [['code_type', 'code_prefix'], 'unique', 'targetAttribute' => ['code_type', 'code_prefix'], 'message' => 'The combination of Code Type and Code Prefix has already been taken.']
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels() {
        return [
            'internal_code_id' => 'Internal Code ID',
            'org_id' => 'Org ID',
            'code_type' => 'Code Type',
            'code_prefix' => 'Code Prefix',
            'code' => 'Code',
            'code_padding' => 'Code Padding',
            'code_suffix' => 'Code Suffix',
            'status' => 'Status',
            'created_at' => 'Created At',
            'created_by' => 'Created By',
            'modified_at' => 'Modified At',
            'modified_by' => 'Modified By',
            'deleted_at' => 'Deleted At',
        ];
    }

    /**
     * @return ActiveQuery
     */
    public function getOrg() {
        return $this->hasOne(CoOrganization::className(), ['org_id' => 'org_id']);
    }

    public static function generateInternalCode($org_id, $code_type, $model, $column) {
        $internal_code = self::find()->where([
                    'org_id' => $org_id,
                    'code_type' => $code_type
                ])->one();

        $code = $internal_code->Fullcode;

        do {
            $exists = $model::find()->andWhere([$column => $code])->one();

            if (!empty($exists)) {
                $old_code = $code;
                self::increaseInternalCode($org_id, $code_type);
                $code = self::find()->where([
                            'org_id' => $org_id,
                            'code_type' => $code_type
                        ])->one()->Fullcode;
            } else {
                break;
            }
        } while ($old_code != $code);

        return $code;
    }

    public static function increaseInternalCode($org_id, $code_type) {
        $code = self::find()->where([
                    'org_id' => $org_id,
                    'code_type' => $code_type
                ])->one();

        if ($code) {
            $code->code = $code->code + 1;
            $code->save(false);
        }
    }

    public function getFullcode() {
        $prefix = $this->code_prefix;
        $int_code = str_pad($this->code, $this->code_padding, '0', STR_PAD_LEFT);
//        $role_suffix = $this->Gen_Suffix;

        return "{$prefix}{$int_code}";
    }

}
